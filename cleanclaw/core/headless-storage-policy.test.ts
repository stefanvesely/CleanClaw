import { describe, expect, it } from 'vitest';
import { assertHeadlessStoragePolicyAllowed, checkHeadlessStoragePolicy } from './headless-storage-policy.js';

describe('headless storage policy guard', () => {
  it('allows interactive flows to choose storage policy with user prompting', () => {
    expect(checkHeadlessStoragePolicy({
      headless: false,
      requestedChoice: 'local',
      approvedStoragePolicy: [],
    })).toMatchObject({
      allowed: true,
    });
  });

  it('allows headless only when the approved policy includes the requested ProjectMap choice', () => {
    expect(checkHeadlessStoragePolicy({
      headless: true,
      requestedChoice: 'compact',
      approvedStoragePolicy: ['ProjectMap storage policy: compact/rebuild before commit.'],
    })).toMatchObject({
      allowed: true,
    });
  });

  it('blocks headless storage policy choices that are not approved in the plan', () => {
    expect(() => assertHeadlessStoragePolicyAllowed({
      headless: true,
      requestedChoice: 'commit',
      approvedStoragePolicy: ['Write records under the project-local task folder.'],
    })).toThrow(/cannot choose ProjectMap storage policy/i);
  });
});
