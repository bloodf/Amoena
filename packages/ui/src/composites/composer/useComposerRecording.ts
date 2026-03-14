import { useCallback, useEffect, useRef, useState } from "react";

export function useComposerRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recordingLabel = `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, "0")}`;

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(data);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const destructive = getComputedStyle(document.documentElement).getPropertyValue("--destructive").trim();
    context.strokeStyle = destructive ? `hsl(${destructive})` : "#ef4444";
    context.lineWidth = 1.5;
    context.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let index = 0; index < bufferLength; index += 1) {
      const value = data[index] / 128.0;
      const y = (value * canvas.height) / 2;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
      x += sliceWidth;
    }

    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((current) => current + 1), 1000);
      requestAnimationFrame(() => drawWaveform());
    } catch {
      // Ignore missing microphone permissions during UI-only interactions.
    }
  }, [drawWaveform]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => () => {
    stopRecording();
  }, [stopRecording]);

  return {
    canvasRef,
    isRecording,
    recordingLabel,
    startRecording,
    stopRecording,
  };
}
