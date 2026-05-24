import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverProjectsWithApproval, formatProjectDiscoveryCandidates } from './project-discovery.js';

describe('project discovery', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-discovery-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('fails closed without explicit approval', () => {
    expect(() => discoverProjectsWithApproval({
      searchRoot: tmpDir,
      approval: {
        approved: false,
        userText: '',
      },
    })).toThrow(/requires explicit user approval/i);
  });

  it('finds marker-based project candidates after approval', () => {
    const appRoot = path.join(tmpDir, 'apps', 'shop');
    const apiRoot = path.join(tmpDir, 'services', 'api');
    fs.mkdirSync(appRoot, { recursive: true });
    fs.mkdirSync(apiRoot, { recursive: true });
    fs.writeFileSync(path.join(appRoot, 'package.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(apiRoot, 'pyproject.toml'), '[project]\nname = "api"', 'utf-8');

    const candidates = discoverProjectsWithApproval({
      searchRoot: tmpDir,
      approval: {
        approved: true,
        userText: 'scan this folder to find my project',
      },
      maxDepth: 3,
    });

    expect(candidates.map(candidate => candidate.root)).toEqual([appRoot, apiRoot]);
    expect(candidates[0].markers[0].label).toBe('Node package');
    expect(candidates[1].markers[0].label).toBe('Python project');
  });

  it('formats discovered candidates with numbered evidence', () => {
    const appRoot = path.join(tmpDir, 'app');
    fs.mkdirSync(appRoot, { recursive: true });
    fs.writeFileSync(path.join(appRoot, 'package.json'), '{}', 'utf-8');

    const output = formatProjectDiscoveryCandidates(discoverProjectsWithApproval({
      searchRoot: tmpDir,
      approval: {
        approved: true,
        userText: 'scan this folder',
      },
    }));

    expect(output).toContain(`1. ${appRoot}`);
    expect(output).toContain('package.json (Node package)');
  });
});
