import { describe, expect, it } from 'vitest';
import { mapEventType } from './map-event-type';

describe('mapEventType', () => {
  describe('returns null for undefined or empty', () => {
    it('returns null when eventType is undefined', () => {
      expect(mapEventType(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(mapEventType('')).toBeNull();
    });
  });

  describe('maps to Start', () => {
    it('maps "Start" to "Start"', () => {
      expect(mapEventType('Start')).toBe('Start');
    });

    it('maps "UserPromptSubmit" to "Start"', () => {
      expect(mapEventType('UserPromptSubmit')).toBe('Start');
    });

    it('maps "PostToolUse" to "Start"', () => {
      expect(mapEventType('PostToolUse')).toBe('Start');
    });

    it('maps "PostToolUseFailure" to "Start"', () => {
      expect(mapEventType('PostToolUseFailure')).toBe('Start');
    });

    it('maps "BeforeAgent" to "Start"', () => {
      expect(mapEventType('BeforeAgent')).toBe('Start');
    });

    it('maps "AfterTool" to "Start"', () => {
      expect(mapEventType('AfterTool')).toBe('Start');
    });

    it('maps "sessionStart" to "Start"', () => {
      expect(mapEventType('sessionStart')).toBe('Start');
    });

    it('maps "userPromptSubmitted" to "Start"', () => {
      expect(mapEventType('userPromptSubmitted')).toBe('Start');
    });

    it('maps "postToolUse" to "Start"', () => {
      expect(mapEventType('postToolUse')).toBe('Start');
    });
  });

  describe('maps to Stop', () => {
    it('maps "Stop" to "Stop"', () => {
      expect(mapEventType('Stop')).toBe('Stop');
    });

    it('maps "agent-turn-complete" to "Stop"', () => {
      expect(mapEventType('agent-turn-complete')).toBe('Stop');
    });

    it('maps "AfterAgent" to "Stop"', () => {
      expect(mapEventType('AfterAgent')).toBe('Stop');
    });

    it('maps "sessionEnd" to "Stop"', () => {
      expect(mapEventType('sessionEnd')).toBe('Stop');
    });
  });

  describe('maps to PermissionRequest', () => {
    it('maps "PermissionRequest" to "PermissionRequest"', () => {
      expect(mapEventType('PermissionRequest')).toBe('PermissionRequest');
    });

    it('maps "Notification" to "PermissionRequest"', () => {
      expect(mapEventType('Notification')).toBe('PermissionRequest');
    });

    it('maps "preToolUse" to "PermissionRequest"', () => {
      expect(mapEventType('preToolUse')).toBe('PermissionRequest');
    });
  });

  describe('returns null for unknown event types', () => {
    it('returns null for "UnknownEvent"', () => {
      expect(mapEventType('UnknownEvent')).toBeNull();
    });

    it('returns null for random strings', () => {
      expect(mapEventType('random')).toBeNull();
      expect(mapEventType('foo bar')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(mapEventType('')).toBeNull();
    });

    it('returns null for partial matches', () => {
      // These are NOT exact matches
      expect(mapEventType('StartExtra')).toBeNull();
      expect(mapEventType('StopExtra')).toBeNull();
      expect(mapEventType('PermissionRequestExtra')).toBeNull();
    });
  });

  describe('case sensitivity', () => {
    it('is case sensitive', () => {
      expect(mapEventType('start')).toBeNull();
      expect(mapEventType('STOP')).toBeNull();
      expect(mapEventType('PERMISSIONREQUEST')).toBeNull();
    });
  });
});
