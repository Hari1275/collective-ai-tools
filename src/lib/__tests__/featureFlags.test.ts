import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  FEATURE_FLAGS,
  getEnabledFeatures,
  isFeatureEnabled,
  updateFeatureFlag,
} from '../featureFlags';

const originalFlags = structuredClone(FEATURE_FLAGS);

afterEach(() => {
  for (const flagName of Object.keys(FEATURE_FLAGS)) {
    delete FEATURE_FLAGS[flagName];
  }
  Object.assign(FEATURE_FLAGS, structuredClone(originalFlags));
  vi.restoreAllMocks();
});

describe('featureFlags', () => {
  describe('isFeatureEnabled', () => {
    it('returns the configured state for ordinary enabled and disabled flags', () => {
      expect(isFeatureEnabled('DARK_MODE')).toBe(true);
      expect(isFeatureEnabled('USER_PROFILES')).toBe(false);
    });

    it('warns and returns false for an unknown flag', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(isFeatureEnabled('DOES_NOT_EXIST')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        "Feature flag 'DOES_NOT_EXIST' not found"
      );
    });

    it('uses a deterministic user hash for percentage rollouts', () => {
      FEATURE_FLAGS.ROLLOUT_TEST = {
        name: 'rollout_test',
        enabled: true,
        description: 'Test percentage rollout',
        rolloutPercentage: 50,
      };

      expect(isFeatureEnabled('ROLLOUT_TEST', 'user-a')).toBe(true);
      expect(isFeatureEnabled('ROLLOUT_TEST', 'user-b')).toBe(false);
      expect(isFeatureEnabled('ROLLOUT_TEST', 'user-a')).toBe(true);
    });

    it('limits a targeted flag to listed users when a user ID is supplied', () => {
      FEATURE_FLAGS.TARGETED_TEST = {
        name: 'targeted_test',
        enabled: true,
        description: 'Test targeted rollout',
        targetUsers: ['included-user'],
      };

      expect(isFeatureEnabled('TARGETED_TEST', 'included-user')).toBe(true);
      expect(isFeatureEnabled('TARGETED_TEST', 'other-user')).toBe(false);
    });

    it('falls back to the configured state when no user ID is supplied', () => {
      FEATURE_FLAGS.TARGETED_TEST = {
        name: 'targeted_test',
        enabled: true,
        description: 'Test targeted rollout',
        targetUsers: ['included-user'],
      };

      expect(isFeatureEnabled('TARGETED_TEST')).toBe(true);
    });

    it('never enables a disabled flag through rollout rules', () => {
      FEATURE_FLAGS.DISABLED_TEST = {
        name: 'disabled_test',
        enabled: false,
        description: 'Test disabled rollout',
        rolloutPercentage: 100,
        targetUsers: ['included-user'],
      };

      expect(isFeatureEnabled('DISABLED_TEST', 'included-user')).toBe(false);
    });
  });

  describe('getEnabledFeatures', () => {
    it('lists only enabled feature keys', () => {
      expect(getEnabledFeatures()).toEqual([
        'DARK_MODE',
        'ADVANCED_SEARCH',
        'VIRTUAL_SCROLLING',
        'LAZY_LOADING',
        'CLICK_TRACKING',
      ]);
    });

    it('reflects runtime flag updates', () => {
      updateFeatureFlag('TOOL_RATINGS', { enabled: true });

      expect(getEnabledFeatures()).toContain('TOOL_RATINGS');
    });
  });

  describe('updateFeatureFlag', () => {
    it('merges partial updates into an existing flag', () => {
      updateFeatureFlag('DARK_MODE', {
        enabled: false,
        description: 'Temporarily disabled',
        targetUsers: ['admin'],
      });

      expect(FEATURE_FLAGS.DARK_MODE).toEqual({
        name: 'dark_mode',
        enabled: false,
        description: 'Temporarily disabled',
        targetUsers: ['admin'],
      });
    });

    it('ignores updates for an unknown flag', () => {
      updateFeatureFlag('DOES_NOT_EXIST', {
        enabled: true,
        description: 'Should not be created',
      });

      expect(FEATURE_FLAGS).not.toHaveProperty('DOES_NOT_EXIST');
    });
  });
});
