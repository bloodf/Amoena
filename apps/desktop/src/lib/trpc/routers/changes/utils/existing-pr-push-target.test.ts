import { describe, expect, it } from 'bun:test';
import {
  isOpenPullRequestState,
  getExistingPRHeadRepoUrl,
  resolveRemoteNameForExistingPRHead,
} from './existing-pr-push-target';

describe('existing-pr-push-target', () => {
  describe('isOpenPullRequestState', () => {
    it('returns true for open state', () => {
      expect(isOpenPullRequestState('open')).toBe(true);
    });

    it('returns true for draft state', () => {
      expect(isOpenPullRequestState('draft')).toBe(true);
    });

    it('returns false for closed state', () => {
      expect(isOpenPullRequestState('closed')).toBe(false);
    });

    it('returns false for merged state', () => {
      expect(isOpenPullRequestState('merged')).toBe(false);
    });
  });

  describe('getExistingPRHeadRepoUrl', () => {
    it('returns null for same-repository PRs', () => {
      const pr = {
        isCrossRepository: false,
        headRepositoryOwner: 'owner',
        headRepositoryName: 'repo',
      };
      expect(getExistingPRHeadRepoUrl(pr)).toBeNull();
    });

    it('returns null when headRepositoryOwner is missing', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: '',
        headRepositoryName: 'repo',
      };
      expect(getExistingPRHeadRepoUrl(pr)).toBeNull();
    });

    it('returns null when headRepositoryName is missing', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: 'owner',
        headRepositoryName: '',
      };
      expect(getExistingPRHeadRepoUrl(pr)).toBeNull();
    });

    it('returns null when isCrossRepository is false despite having owner/name', () => {
      const pr = {
        isCrossRepository: false,
        headRepositoryOwner: 'owner',
        headRepositoryName: 'repo',
      };
      expect(getExistingPRHeadRepoUrl(pr)).toBeNull();
    });

    it('returns URL for cross-repository PRs', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: 'owner',
        headRepositoryName: 'repo',
      };
      expect(getExistingPRHeadRepoUrl(pr)).toBe('https://github.com/owner/repo');
    });
  });

  describe('resolveRemoteNameForExistingPRHead', () => {
    const remotes = [
      { name: 'origin', fetchUrl: 'git@github.com:owner/repo.git' },
      { name: 'upstream', fetchUrl: 'git@github.com:other/repo.git' },
    ];

    it('returns fallback remote for same-repository PRs', () => {
      const pr = {
        isCrossRepository: false,
        headRepositoryOwner: '',
        headRepositoryName: '',
      };
      expect(resolveRemoteNameForExistingPRHead({ remotes, pr, fallbackRemote: 'origin' })).toBe(
        'origin',
      );
    });

    it('returns null when cross-repository but no head repo info', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: '',
        headRepositoryName: '',
      };
      expect(
        resolveRemoteNameForExistingPRHead({ remotes, pr, fallbackRemote: 'origin' }),
      ).toBeNull();
    });

    it('matches remote by fetchUrl', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: 'other',
        headRepositoryName: 'repo',
      };
      expect(resolveRemoteNameForExistingPRHead({ remotes, pr, fallbackRemote: 'origin' })).toBe(
        'upstream',
      );
    });

    it('matches remote by pushUrl', () => {
      const remotesWithPush = [
        { name: 'origin', fetchUrl: 'git@github.com:owner/repo.git' },
        { name: 'fork', fetchUrl: undefined, pushUrl: 'git@github.com:other/repo.git' },
      ];
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: 'other',
        headRepositoryName: 'repo',
      };
      expect(
        resolveRemoteNameForExistingPRHead({
          remotes: remotesWithPush,
          pr,
          fallbackRemote: 'origin',
        }),
      ).toBe('fork');
    });

    it('returns null when no matching remote found', () => {
      const pr = {
        isCrossRepository: true,
        headRepositoryOwner: 'unknown',
        headRepositoryName: 'repo',
      };
      expect(
        resolveRemoteNameForExistingPRHead({ remotes, pr, fallbackRemote: 'origin' }),
      ).toBeNull();
    });
  });
});
