import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectProjectMarkers, detectProjectMarkersFromPaths, formatProjectMarkers } from './project-markers.js';

describe('project marker detection', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanclaw-project-markers-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects root-level project markers', () => {
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(tmpDir, 'vite.config.ts'), 'export default {};', 'utf-8');

    const markers = detectProjectMarkers(tmpDir);

    expect(markers.map(marker => marker.relativePath)).toEqual([
      '.git',
      'package.json',
      'vite.config.ts',
    ]);
  });

  it('formats empty marker sets clearly', () => {
    expect(formatProjectMarkers([])).toEqual(['none']);
  });

  it('detects markers from ProjectMap-style relative paths', () => {
    const markers = detectProjectMarkersFromPaths(tmpDir, [
      'package.json',
      'src/app.ts',
      'next.config.mjs',
    ]);

    expect(markers.map(marker => `${marker.relativePath}:${marker.label}`)).toEqual([
      'package.json:Node package',
      'next.config.mjs:Next.js config',
    ]);
  });

  it('detects broader stack fixture marker files', () => {
    for (const file of [
      'angular.json',
      'nuxt.config.ts',
      'manage.py',
      'composer.json',
      'artisan',
      'Gemfile',
      'pubspec.yaml',
      'react-native.config.js',
      'Dockerfile',
    ]) {
      fs.writeFileSync(path.join(tmpDir, file), '', 'utf-8');
    }
    fs.mkdirSync(path.join(tmpDir, '.github', 'workflows'), { recursive: true });

    const labels = detectProjectMarkers(tmpDir).map(marker => marker.label);

    expect(labels).toEqual(expect.arrayContaining([
      'Angular config',
      'Nuxt config',
      'Django manage.py',
      'PHP Composer package',
      'Laravel artisan',
      'Ruby bundle',
      'Flutter pubspec',
      'React Native config',
      'Dockerfile',
      'GitHub Actions workflow',
    ]));
  });
});
