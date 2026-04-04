import { randomInt } from 'crypto';

export { generatePairingCode, getPairedDeviceIds, revokeDevice } from './pairing';

const PIN_LENGTH = 6;
const PIN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export type PairingIntent = {
  pin: string;
  qrData: string;
  expiresAt: number;
};

export type PairingResult = {
  success: boolean;
  error?: string;
};

export type PairingServiceOptions = {
  baseUrl: string;
  deviceId: string;
};

function generatePin(): string {
  return String(randomInt(0, 10 ** PIN_LENGTH)).padStart(PIN_LENGTH, '0');
}

export class PairingService {
  private activePin: string | null = null;
  private pinExpiresAt: number | null = null;
  private readonly options: PairingServiceOptions;

  constructor(options: PairingServiceOptions) {
    this.options = options;
  }

  generatePairingIntent(): PairingIntent {
    const pin = generatePin();
    const expiresAt = Date.now() + PIN_EXPIRY_MS;

    this.activePin = pin;
    this.pinExpiresAt = expiresAt;

    const qrData = JSON.stringify({
      url: this.options.baseUrl,
      deviceId: this.options.deviceId,
      pin,
    });

    return { pin, qrData, expiresAt };
  }

  validatePin(pin: string): PairingResult {
    if (!this.activePin || !this.pinExpiresAt) {
      return { success: false, error: 'no active pairing intent' };
    }

    if (Date.now() > this.pinExpiresAt) {
      this.activePin = null;
      this.pinExpiresAt = null;
      return { success: false, error: 'pairing pin has expired' };
    }

    if (pin !== this.activePin) {
      return { success: false, error: 'invalid pin' };
    }

    this.activePin = null;
    this.pinExpiresAt = null;
    return { success: true };
  }

  isPinActive(): boolean {
    if (!this.activePin || !this.pinExpiresAt) return false;
    return Date.now() < this.pinExpiresAt;
  }

  clearPairingIntent(): void {
    this.activePin = null;
    this.pinExpiresAt = null;
  }
}
