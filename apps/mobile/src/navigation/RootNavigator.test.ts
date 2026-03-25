import { describe, expect, it } from 'vitest';

import { ROOT_STACK_OPTIONS } from './RootNavigator';

describe('RootNavigator', () => {
  describe('ROOT_STACK_OPTIONS', () => {
    it('has headerStyle with backgroundColor', () => {
      expect(ROOT_STACK_OPTIONS.headerStyle).toHaveProperty('backgroundColor');
    });

    it('has headerTintColor set', () => {
      expect(ROOT_STACK_OPTIONS.headerTintColor).toBeTruthy();
    });

    it('has contentStyle with backgroundColor', () => {
      expect(ROOT_STACK_OPTIONS.contentStyle).toHaveProperty('backgroundColor');
    });
  });
});
