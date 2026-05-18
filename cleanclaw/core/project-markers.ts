import fs from 'fs';
import path from 'path';

export interface ProjectMarker {
  label: string;
  relativePath: string;
  kind: 'cleanclaw' | 'git' | 'node' | 'dotnet' | 'python' | 'go' | 'rust' | 'java' | 'framework';
}

const MARKERS: ProjectMarker[] = [
  { label: 'CleanClaw config', relativePath: 'cleanclaw.config.json', kind: 'cleanclaw' },
  { label: 'CleanClaw settings', relativePath: path.join('.cleanclaw', 'settings.json'), kind: 'cleanclaw' },
  { label: 'Git repository', relativePath: '.git', kind: 'git' },
  { label: 'Node package', relativePath: 'package.json', kind: 'node' },
  { label: 'npm lockfile', relativePath: 'package-lock.json', kind: 'node' },
  { label: 'pnpm lockfile', relativePath: 'pnpm-lock.yaml', kind: 'node' },
  { label: 'Yarn lockfile', relativePath: 'yarn.lock', kind: 'node' },
  { label: '.NET solution', relativePath: '*.sln', kind: 'dotnet' },
  { label: '.NET project', relativePath: '*.csproj', kind: 'dotnet' },
  { label: 'Python project', relativePath: 'pyproject.toml', kind: 'python' },
  { label: 'Python requirements', relativePath: 'requirements.txt', kind: 'python' },
  { label: 'Go module', relativePath: 'go.mod', kind: 'go' },
  { label: 'Rust crate', relativePath: 'Cargo.toml', kind: 'rust' },
  { label: 'Maven project', relativePath: 'pom.xml', kind: 'java' },
  { label: 'Gradle build', relativePath: 'build.gradle', kind: 'java' },
  { label: 'Gradle Kotlin build', relativePath: 'build.gradle.kts', kind: 'java' },
  { label: 'Vite config', relativePath: 'vite.config.*', kind: 'framework' },
  { label: 'Next.js config', relativePath: 'next.config.*', kind: 'framework' },
  { label: 'Svelte config', relativePath: 'svelte.config.*', kind: 'framework' },
];

export interface DetectedProjectMarker extends ProjectMarker {
  absolutePath: string;
}

export function detectProjectMarkers(projectRoot: string): DetectedProjectMarker[] {
  const root = path.resolve(projectRoot);
  return MARKERS.flatMap(marker => {
    const matches = marker.relativePath.includes('*')
      ? findWildcardMatches(root, marker.relativePath)
      : findExactMatch(root, marker.relativePath);

    return matches.map(absolutePath => ({
      ...marker,
      absolutePath,
      relativePath: path.relative(root, absolutePath) || marker.relativePath,
    }));
  });
}

export function formatProjectMarkers(markers: DetectedProjectMarker[]): string[] {
  if (markers.length === 0) return ['none'];
  return markers.map(marker => `${marker.relativePath} (${marker.label})`);
}

function findExactMatch(root: string, relativePath: string): string[] {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? [absolutePath] : [];
}

function findWildcardMatches(root: string, relativePattern: string): string[] {
  const directory = path.dirname(relativePattern);
  const basenamePattern = path.basename(relativePattern);
  const searchDir = path.join(root, directory === '.' ? '' : directory);
  if (!fs.existsSync(searchDir)) return [];

  const regex = new RegExp(`^${escapeRegExp(basenamePattern).replace('\\*', '.*')}$`);
  return fs.readdirSync(searchDir)
    .filter(name => regex.test(name))
    .map(name => path.join(searchDir, name));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
