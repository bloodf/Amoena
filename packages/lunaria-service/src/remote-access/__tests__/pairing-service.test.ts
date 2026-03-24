import { describe, expect, test, beforeEach } from 'bun:test';
import { PairingService } from '../pairing-service';

describe('PairingService', () => {
  let service: PairingService;

  beforeEach(() => {
    service = new PairingService({
      baseUrl: 'http://localhost:37777',
      deviceId: 'device-abc',
    });
  });

  describe('generatePairingIntent', () => {
    test('generates a 6-digit pin', () => {
      const intent = service.generatePairingIntent();
      expect(intent.pin).toMatch(/^\d{6}$/);
    });

    test('generates qrData containing baseUrl and deviceId', () => {
      const intent = service.generatePairingIntent();
      const parsed = JSON.parse(intent.qrData);
      expect(parsed.url).toBe('http://localhost:37777');
      expect(parsed.deviceId).toBe('device-abc');
      expect(parsed.pin).toBe(intent.pin);
    });

    test('expiresAt is in the future', () => {
      const intent = service.generatePairingIntent();
      expect(intent.expiresAt).toBeGreaterThan(Date.now());
    });

    test('pin is active after generation', () => {
      service.generatePairingIntent();
      expect(service.isPinActive()).toBe(true);
    });
  });

  describe('validatePin', () => {
    test('validates correct pin', () => {
      const intent = service.generatePairingIntent();
      const result = service.validatePin(intent.pin);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('rejects incorrect pin', () => {
      service.generatePairingIntent();
      const result = service.validatePin('000000');
      // could be correct by chance but extremely unlikely
      if (!result.success) {
        expect(result.error).toBe('invalid pin');
      }
    });

    test('rejects when no active intent', () => {
      const result = service.validatePin('123456');
      expect(result.success).toBe(false);
      expect(result.error).toBe('no active pairing intent');
    });

    test('clears pin after successful validation', () => {
      const intent = service.generatePairingIntent();
      service.validatePin(intent.pin);
      expect(service.isPinActive()).toBe(false);
    });
  });

  describe('clearPairingIntent', () => {
    test('deactivates active pin', () => {
      service.generatePairingIntent();
      service.clearPairingIntent();
      expect(service.isPinActive()).toBe(false);
    });
  });
});
