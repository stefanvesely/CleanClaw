import { describe, expect, it } from 'vitest';
import { formatStackInference, inferProjectStack } from './stack-inference.js';
import type { DetectedProjectMarker } from './project-markers.js';

describe('stack inference', () => {
  it('scores detected project signals and returns a best guess', () => {
    const result = inferProjectStack([
      marker('Node package', 'package.json', 'node'),
      marker('npm lockfile', 'package-lock.json', 'node'),
    ]);

    expect(result.bestGuess).toMatchObject({
      stack: 'node',
      score: 6,
      confidence: 'high',
      evidence: ['package.json (Node package)', 'package-lock.json (npm lockfile)'],
    });
    expect(result.mixedStack).toBe(false);
  });

  it('detects framework-specific stacks from marker labels', () => {
    const result = inferProjectStack([
      marker('Node package', 'package.json', 'node'),
      marker('Next.js config', 'next.config.js', 'framework'),
    ]);

    expect(result.candidates.map(candidate => candidate.stack)).toEqual(['nextjs', 'node']);
    expect(result.bestGuess?.stack).toBe('nextjs');
    expect(result.mixedStack).toBe(true);
  });

  it('returns ambiguity notes for mixed-stack projects', () => {
    const result = inferProjectStack([
      marker('Node package', 'package.json', 'node'),
      marker('Python project', 'pyproject.toml', 'python'),
    ]);

    expect(result.mixedStack).toBe(true);
    expect(result.ambiguityNotes).toContain('node: package.json (Node package)');
    expect(result.ambiguityNotes).toContain('python: pyproject.toml (Python project)');
  });

  it('formats best guess and evidence', () => {
    const output = formatStackInference(inferProjectStack([
      marker('Rust crate', 'Cargo.toml', 'rust'),
    ]));

    expect(output).toContain('Best guess: rust (medium confidence)');
    expect(output).toContain('- Cargo.toml (Rust crate)');
  });

  it('formats missing stack evidence', () => {
    expect(formatStackInference(inferProjectStack([]))).toBe('No stack could be inferred from project markers.');
  });

  it('covers stack fixture signals from known project markers', () => {
    const fixtures: Array<[string, DetectedProjectMarker]> = [
      ['nextjs', marker('Next.js config', 'next.config.mjs', 'framework')],
      ['vite', marker('Vite config', 'vite.config.ts', 'framework')],
      ['svelte', marker('Svelte config', 'svelte.config.js', 'framework')],
      ['angular', marker('Angular config', 'angular.json', 'framework')],
      ['vue', marker('Vue config', 'vue.config.js', 'framework')],
      ['nuxt', marker('Nuxt config', 'nuxt.config.ts', 'framework')],
      ['dotnet', marker('.NET project', 'App.csproj', 'dotnet')],
      ['python', marker('Python project', 'pyproject.toml', 'python')],
      ['django', marker('Django manage.py', 'manage.py', 'framework')],
      ['go', marker('Go module', 'go.mod', 'go')],
      ['rust', marker('Rust crate', 'Cargo.toml', 'rust')],
      ['java', marker('Maven project', 'pom.xml', 'java')],
      ['php', marker('PHP Composer package', 'composer.json', 'php')],
      ['laravel', marker('Laravel artisan', 'artisan', 'framework')],
      ['ruby', marker('Ruby bundle', 'Gemfile', 'ruby')],
      ['flutter', marker('Flutter pubspec', 'pubspec.yaml', 'flutter')],
      ['react-native', marker('React Native config', 'react-native.config.js', 'framework')],
      ['docker', marker('Dockerfile', 'Dockerfile', 'docker')],
      ['cicd', marker('GitHub Actions workflow', '.github/workflows', 'ci')],
    ];

    for (const [expected, signal] of fixtures) {
      expect(inferProjectStack([signal]).bestGuess?.stack).toBe(expected);
    }
  });
});

function marker(
  label: DetectedProjectMarker['label'],
  relativePath: string,
  kind: DetectedProjectMarker['kind'],
): DetectedProjectMarker {
  return {
    label,
    relativePath,
    kind,
    absolutePath: `/repo/${relativePath}`,
  };
}
