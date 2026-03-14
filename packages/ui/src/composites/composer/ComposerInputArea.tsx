import { Mic, Send, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposerInputAreaProps {
  isRecording: boolean;
  recordingTime: string;
  isShellMode: boolean;
  message: string;
  canSubmit?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onMessageChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onPaste: (event: React.ClipboardEvent) => void;
  onRecordingToggle: () => void;
  onSubmit?: () => void;
}

export function ComposerInputArea({
  isRecording,
  recordingTime,
  isShellMode,
  message,
  canSubmit = true,
  textareaRef,
  canvasRef,
  onMessageChange,
  onKeyDown,
  onPaste,
  onRecordingToggle,
  onSubmit,
}: ComposerInputAreaProps) {
  return (
    <div className="flex items-end gap-2">
      {isRecording ? (
        <div className="flex min-h-[36px] flex-1 items-center gap-3 py-2">
          <div className="flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5" style={{ width: 150 }}>
            <div className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-destructive" />
            <canvas ref={canvasRef} width={80} height={24} className="flex-1" style={{ width: 80, height: 24 }} />
            <span className="flex-shrink-0 font-mono tabular-nums text-[10px] text-destructive">{recordingTime}</span>
          </div>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder="Ask anything... @ files, $ skills, / commands"
          className={cn(
            "min-h-[36px] flex-1 resize-none bg-transparent py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
            isShellMode && "font-mono text-green",
          )}
          rows={1}
        />
      )}

      <div className="flex flex-shrink-0 items-center gap-1 pb-1.5">
        <button
          onClick={onRecordingToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all",
            isRecording ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
          )}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? <Square size={12} /> : <Mic size={14} />}
        </button>
        <button
          disabled={!canSubmit}
          onClick={onSubmit}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors hover:bg-primary/90"
          aria-label="Send message"
        >
          <Send size={14} className="-rotate-90" />
        </button>
      </div>
    </div>
  );
}
