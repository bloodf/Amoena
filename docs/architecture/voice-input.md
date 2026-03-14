# Voice Input

## Scope

This document defines Lunaria's on-device speech-to-text architecture for voice input in agent chat sessions, covering the transcription engine, audio capture pipeline, interaction modes, platform considerations, and integration with the existing session system.

**Priority**: V2.0

## Overview

Lunaria provides on-device speech-to-text so users can dictate instructions to agents hands-free. All audio capture and transcription runs locally — no audio data leaves the machine. The engine is Whisper.cpp with Rust bindings, chosen for cross-platform support across macOS, Windows, and Linux. The Tauri main process owns the voice subsystem lifecycle, consistent with its role as the state authority.

## Motivation

| Goal | Rationale |
|------|-----------|
| Hands-free interaction | Users can dictate complex instructions while reading code or reviewing output without switching to keyboard input. |
| Faster input for complex instructions | Spoken descriptions of multi-step tasks are often faster than typing them out. |
| Accessibility | Voice input provides an alternative input modality for users who cannot or prefer not to use a keyboard. |
| Privacy | All transcription runs on-device. No audio is sent to any cloud service, no network calls are made during capture or transcription. |

## Architecture

### Engine

Whisper.cpp is a C/C++ port of OpenAI's Whisper model optimized for local inference. Lunaria uses the [`whisper-rs`](https://github.com/tazz4843/whisper-rs) crate for Rust bindings, loaded as a module in the Tauri main process.

Key properties:

- Runs on CPU (AVX2/NEON) with optional Metal acceleration on macOS and CUDA on supported GPUs.
- Model weights loaded once at enable-time and held in memory for the session.
- Thread pool size configurable (default: 4 threads) to balance transcription speed against system load.

### Models

| Model | Size on Disk | RAM Usage | Relative Speed | Best For |
|-------|-------------|-----------|----------------|----------|
| `tiny` | ~75 MB | ~390 MB | Fastest | Short commands, low-end hardware |
| `base` | ~142 MB | ~500 MB | Balanced | General use (default) |
| `small` | ~466 MB | ~1 GB | Slowest | Best accuracy, complex technical terms |

Model selection is a user-facing setting. The default is `base` as a balance between accuracy and resource usage. Models are GGML-quantized for reduced memory footprint.

### Audio Capture

Audio capture uses the [`cpal`](https://github.com/RustAudioApps/cpal) crate, which provides a unified Rust API over platform-native audio backends:

| Platform | Backend |
|----------|---------|
| macOS | CoreAudio |
| Windows | WASAPI |
| Linux | PulseAudio / ALSA |

Capture parameters:

- Sample rate: 16 kHz (Whisper's native rate; `cpal` handles resampling if the device default differs)
- Channels: mono
- Format: 32-bit float PCM
- Buffer size: 30 ms frames

### Processing Pipeline

```
┌──────────────┐    ┌─────────────────┐    ┌───────────────────┐    ┌────────────────┐
│ Audio Capture │───▶│ Voice Activity  │───▶│ Whisper.cpp       │───▶│ Text Insertion  │
│ (cpal)        │    │ Detection (VAD) │    │ Transcription     │    │ (Session Input) │
└──────────────┘    └─────────────────┘    └───────────────────┘    └────────────────┘
       │                    │                       │                        │
   16 kHz mono         energy-based            model inference          invoke() to
   float PCM           speech/silence           on buffered audio       session manager
                       classification
```

The pipeline runs as a dedicated Rust task in the Tauri main process. Audio frames are collected into a ring buffer. When the active mode (push-to-talk or VAD) signals a complete utterance, the buffered audio is passed to Whisper.cpp for transcription. The resulting text is delivered to the frontend via a Tauri event.

### State Machine

```
            ┌─────────┐
            │  Idle    │◀──────────────────────────────┐
            └────┬─────┘                               │
                 │ hotkey press / VAD speech detected   │
                 ▼                                     │
            ┌─────────┐                               │
            │ Capturing│                               │
            └────┬─────┘                               │
                 │ hotkey release / VAD silence         │
                 ▼                                     │
         ┌──────────────┐                              │
         │ Transcribing  │                              │
         └───────┬───────┘                              │
                 │ transcription complete                │
                 ▼                                     │
         ┌──────────────┐     user sends / discards    │
         │ Preview       │─────────────────────────────┘
         └──────────────┘
```

State transitions are managed by a `VoiceInputManager` in the Tauri main process. The frontend subscribes to `voice://state-change` Tauri events to update UI indicators.

## Modes

### Push-to-Talk

The simplest and most predictable mode. A global hotkey (default: `CommandOrControl+Shift+V`) controls the capture window.

| Phase | Behavior |
|-------|----------|
| Hotkey down | Audio capture begins, UI shows recording indicator |
| Hotkey held | Audio frames accumulate in ring buffer |
| Hotkey up | Capture stops, buffered audio sent to Whisper.cpp |
| Transcription complete | Result text inserted into active chat input field |

Properties:

- Lowest latency: no VAD processing overhead during capture.
- Most predictable: user explicitly controls when recording starts and stops.
- Registered via Tauri's `global_shortcut` API, works even when Lunaria is not focused.

### Voice Activity Detection (VAD)

Continuous listening mode that automatically detects speech boundaries.

- Uses energy-based VAD with a configurable threshold (`vad_threshold`, default: 0.5).
- Speech onset: energy exceeds threshold for 300 ms sustained.
- Speech offset: energy drops below threshold for 800 ms sustained.
- Audio outside speech regions is discarded (not buffered, not transcribed).
- Higher resource usage than push-to-talk due to continuous audio capture.

**Optional wake word**: When `wake_word` is configured (e.g., `"hey lunaria"`), the VAD pipeline adds a keyword-spotting stage before triggering transcription. A lightweight keyword detector runs on the continuous audio stream; full Whisper transcription only activates after wake word detection. This reduces spurious transcriptions when the user is speaking to someone else.

### Global Transcription

Transcribes speech and inserts the result into any focused text field on the system, not just Lunaria's chat input.

- Activated via a separate global hotkey (configurable).
- Uses OS accessibility APIs to insert text at the cursor position:
  - macOS: `CGEventPost` with key events or `NSAccessibility` protocols.
  - Windows: `SendInput` API.
  - Linux: `xdotool` or `ydotool` (Wayland).
- Gated behind an explicit `global_transcription` setting (default: `false`) because it requires additional OS permissions.

## Integration

### Session Input

Voice input produces regular text that is inserted into the chat input field. From the session system's perspective, voice-originated text is indistinguishable from keyboard-originated text. No changes to the session manager or agent orchestrator are required.

Flow:

1. `VoiceInputManager` emits `voice://transcription` Tauri event with `{ text: string, duration_ms: number }`.
2. Frontend receives the event and populates the chat input field.
3. User can review and edit the transcribed text before sending.
4. User sends the message through the normal session flow.

### UI Indicators

| State | Visual |
|-------|--------|
| Idle | Microphone icon in chat input toolbar (muted style) |
| Capturing | Microphone icon pulsing, optional audio waveform visualization |
| Transcribing | Spinner replacing microphone icon |
| Preview | Transcribed text in input field with subtle highlight indicating voice origin |

The waveform visualization during capture is optional and rendered in the frontend using a lightweight canvas element. Audio amplitude data is streamed via Tauri events at ~60 Hz.

## Configuration

```jsonc
// In Lunaria settings (merged with defaults)
{
  "voice": {
    "enabled": false,
    "model": "base",
    "mode": "push-to-talk",
    "hotkey": "CommandOrControl+Shift+V",
    "language": "en",
    "vad_threshold": 0.5,
    "wake_word": null,
    "global_transcription": false,
    "threads": 4
  }
}
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `enabled` | `boolean` | `false` | Master toggle. When false, no audio capture or model loading occurs. |
| `model` | `"tiny" \| "base" \| "small"` | `"base"` | Whisper model variant. |
| `mode` | `"push-to-talk" \| "vad"` | `"push-to-talk"` | Active input mode. |
| `hotkey` | `string` | `"CommandOrControl+Shift+V"` | Global shortcut for push-to-talk or global transcription trigger. |
| `language` | `string` | `"en"` | ISO 639-1 language code passed to Whisper for improved accuracy. |
| `vad_threshold` | `number` | `0.5` | Energy threshold for VAD speech detection (0.0–1.0). |
| `wake_word` | `string \| null` | `null` | Optional wake phrase for VAD mode. |
| `global_transcription` | `boolean` | `false` | Enable transcription into any focused text field. |
| `threads` | `number` | `4` | Whisper inference thread count. |

## Platform Considerations

| Platform | Audio Backend | Permissions Required | Notes |
|----------|--------------|---------------------|-------|
| macOS | CoreAudio via `cpal` | Microphone permission (TCC prompt) | Metal acceleration available for Whisper.cpp inference. |
| Windows | WASAPI via `cpal` | Microphone permission (Settings → Privacy) | No GPU acceleration by default; CUDA optional. |
| Linux | PulseAudio / ALSA via `cpal` | Usually no explicit prompt required | PipeWire supported through PulseAudio compatibility. |

Permission flow:

- On first enable, the Tauri main process requests microphone access through the OS permission API.
- If denied, the voice feature is disabled and the UI shows a prompt directing the user to system settings.
- Permission state is checked on each app launch; if revoked, voice is auto-disabled.

## Model Management

Models are **not bundled** with the application binary to keep download size reasonable. Instead:

1. User enables voice input in settings and selects a model.
2. Lunaria checks the data directory (`$LUNARIA_DATA/models/whisper/`) for the model file.
3. If missing, the model is downloaded from a CDN (Hugging Face mirror) with progress shown in the UI.
4. Downloaded models are verified against a SHA-256 checksum.
5. The model picker in settings shows each variant's size, estimated download time, and accuracy trade-off.

Model files persist across updates. Users can delete models from settings to reclaim disk space.

## Competitive Reference

| Aspect | Osaurus | Lunaria |
|--------|---------|---------|
| Engine | FluidAudio on Apple Neural Engine | Whisper.cpp (CPU + optional GPU) |
| Platform | macOS only | macOS, Windows, Linux |
| Latency | Very fast (hardware-accelerated Neural Engine) | Moderate (CPU inference; Metal/CUDA optional) |
| Model size | Proprietary, optimized for Neural Engine | Open Whisper models (75 MB–466 MB) |
| Privacy | On-device | On-device |
| VAD | Yes, with wake word | Yes, with optional wake word |
| Global transcription | Yes (any app) | Yes (any app, opt-in) |

Lunaria trades Apple-specific hardware acceleration for cross-platform reach. On macOS, Metal acceleration through Whisper.cpp partially closes the latency gap. The open Whisper model ecosystem also allows users to choose their accuracy/speed trade-off and supports a broader set of languages.

## Dependencies

| Crate | Purpose |
|-------|---------|
| `whisper-rs` | Rust bindings for Whisper.cpp inference |
| `cpal` | Cross-platform audio capture |
| `tauri::global_shortcut` | Global hotkey registration |
| `ringbuf` (or equivalent) | Lock-free ring buffer for audio frames |

## Open Questions

- **GPU acceleration defaults**: Should Metal/CUDA be enabled by default when available, or opt-in?
- **Streaming transcription**: Whisper processes complete utterances. Investigate partial/streaming results for real-time feedback during long dictation.
- **Model updates**: Strategy for shipping updated Whisper model weights without full app updates.
- **Mobile voice input**: React Native mobile client may use platform-native speech APIs (Apple Speech, Android SpeechRecognizer) instead of Whisper.cpp. Deferred to mobile phase.

*Last updated: 2025-07-18*
