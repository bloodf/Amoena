var PtySubprocessIpcType = /* @__PURE__ */ ((PtySubprocessIpcType2) => {
  PtySubprocessIpcType2[PtySubprocessIpcType2["Spawn"] = 1] = "Spawn";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Write"] = 2] = "Write";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Resize"] = 3] = "Resize";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Kill"] = 4] = "Kill";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Dispose"] = 5] = "Dispose";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Signal"] = 6] = "Signal";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Ready"] = 101] = "Ready";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Spawned"] = 102] = "Spawned";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Data"] = 103] = "Data";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Exit"] = 104] = "Exit";
  PtySubprocessIpcType2[PtySubprocessIpcType2["Error"] = 105] = "Error";
  return PtySubprocessIpcType2;
})(PtySubprocessIpcType || {});
const HEADER_BYTES = 5;
const EMPTY_PAYLOAD = Buffer.alloc(0);
const MAX_FRAME_BYTES = 64 * 1024 * 1024;
function createFrameHeader(type, payloadLength) {
  const header = Buffer.allocUnsafe(HEADER_BYTES);
  header.writeUInt8(type, 0);
  header.writeUInt32LE(payloadLength, 1);
  return header;
}
function writeFrame(writable, type, payload) {
  const payloadBuffer = payload ?? EMPTY_PAYLOAD;
  const header = createFrameHeader(type, payloadBuffer.length);
  let canWrite = writable.write(header);
  if (payloadBuffer.length > 0) {
    canWrite = writable.write(payloadBuffer) && canWrite;
  }
  return canWrite;
}
class PtySubprocessFrameDecoder {
  header = Buffer.allocUnsafe(HEADER_BYTES);
  headerOffset = 0;
  frameType = null;
  payload = null;
  payloadOffset = 0;
  push(chunk) {
    const frames = [];
    let offset = 0;
    while (offset < chunk.length) {
      if (this.payload === null) {
        const headerNeeded = HEADER_BYTES - this.headerOffset;
        const available = chunk.length - offset;
        const toCopy = Math.min(headerNeeded, available);
        chunk.copy(this.header, this.headerOffset, offset, offset + toCopy);
        this.headerOffset += toCopy;
        offset += toCopy;
        if (this.headerOffset < HEADER_BYTES) {
          continue;
        }
        const type = this.header.readUInt8(0);
        const payloadLength = this.header.readUInt32LE(1);
        if (payloadLength > MAX_FRAME_BYTES) {
          throw new Error(
            `PtySubprocess IPC frame too large: ${payloadLength} bytes`
          );
        }
        this.frameType = type;
        this.payload = payloadLength > 0 ? Buffer.allocUnsafe(payloadLength) : null;
        this.payloadOffset = 0;
        this.headerOffset = 0;
        if (payloadLength === 0) {
          frames.push({ type, payload: EMPTY_PAYLOAD });
          this.frameType = null;
        }
      } else {
        const payloadNeeded = this.payload.length - this.payloadOffset;
        const available = chunk.length - offset;
        const toCopy = Math.min(payloadNeeded, available);
        chunk.copy(this.payload, this.payloadOffset, offset, offset + toCopy);
        this.payloadOffset += toCopy;
        offset += toCopy;
        if (this.payloadOffset < this.payload.length) {
          continue;
        }
        const type = this.frameType ?? 105;
        const payload = this.payload;
        this.frameType = null;
        this.payload = null;
        this.payloadOffset = 0;
        frames.push({ type, payload });
      }
    }
    return frames;
  }
}
const SHELL_READY_MARKER = "\x1B]777;AmoenaAiell-ready\x07";
export {
  PtySubprocessFrameDecoder as P,
  SHELL_READY_MARKER as S,
  PtySubprocessIpcType as a,
  createFrameHeader as c,
  writeFrame as w
};
//# sourceMappingURL=pty-subprocess-ipc-BZlxl0DS.js.map
