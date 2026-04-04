import { describe, expect, test } from "vitest";

import { initialRemoteDevices, relayConfig } from './config';
import type { RelayStatus } from './types';

describe('relayConfig', () => {
  const statuses: RelayStatus[] = ['lan', 'relay', 'offline', 'waiting'];

  test('every status has label, color, and iconKey', () => {
    for (const status of statuses) {
      const config = relayConfig[status];
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.iconKey).toBeTruthy();
    }
  });

  test('lan uses green color', () => {
    expect(relayConfig.lan.color).toContain('green');
  });

  test('offline uses destructive color', () => {
    expect(relayConfig.offline.color).toContain('destructive');
  });

  test('relay uses warning color', () => {
    expect(relayConfig.relay.color).toContain('warning');
  });

  test('waiting uses muted color', () => {
    expect(relayConfig.waiting.color).toContain('muted');
  });

  test('icon keys are valid values', () => {
    const validIcons = ['wifi', 'radio', 'wifi-off', 'clock'];
    for (const status of statuses) {
      expect(validIcons).toContain(relayConfig[status].iconKey);
    }
  });
});

describe('initialRemoteDevices', () => {
  test('has at least one device', () => {
    expect(initialRemoteDevices.length).toBeGreaterThan(0);
  });

  test('each device has required fields', () => {
    for (const device of initialRemoteDevices) {
      expect(device.name).toBeTruthy();
      expect(device.ip).toBeTruthy();
      expect(device.connectedSince).toBeTruthy();
      expect(typeof device.trusted).toBe('boolean');
      expect(device.lastSeen).toBeTruthy();
      expect(device.relay).toBeTruthy();
      expect(device.permissions.length).toBeGreaterThan(0);
    }
  });
});
