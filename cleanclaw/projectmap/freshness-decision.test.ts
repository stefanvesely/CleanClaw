import { describe, expect, it } from "vitest";
import {
  createProjectMapFreshnessPrompt,
  decideProjectMapFreshnessAction,
  formatProjectMapFreshnessSummary,
} from "./freshness-decision.js";
import type { ProjectMapFreshness } from "./manifest.js";

function freshness(status: ProjectMapFreshness["status"], patch: Partial<ProjectMapFreshness> = {}): ProjectMapFreshness {
  return {
    status,
    manifestPath: "/repo/.cleanclaw/projectmap/manifest.json",
    changed: [],
    added: [],
    deleted: [],
    unchanged: [],
    ...patch,
  };
}

describe("ProjectMap freshness decisions", () => {
  it("reuses a fresh ProjectMap without prompting", () => {
    const current = freshness("fresh", { unchanged: ["src/app.ts"] });

    expect(decideProjectMapFreshnessAction(current)).toBe("reuse");
    expect(createProjectMapFreshnessPrompt(current)).toBeNull();
    expect(formatProjectMapFreshnessSummary(current)).toContain("fresh");
  });

  it("prompts to build when ProjectMap is missing", () => {
    const missing = freshness("missing");
    const prompt = createProjectMapFreshnessPrompt(missing);

    expect(decideProjectMapFreshnessAction(missing)).toBe("build");
    expect(prompt?.defaultId).toBe("build");
    expect(prompt?.options.map(option => option.id)).toEqual(["build", "skip"]);
  });

  it("prompts to rebuild, continue, or skip when ProjectMap is stale", () => {
    const stale = freshness("stale", {
      changed: ["src/app.ts"],
      added: ["src/new.ts"],
      deleted: ["src/old.ts"],
    });
    const prompt = createProjectMapFreshnessPrompt(stale);

    expect(decideProjectMapFreshnessAction(stale)).toBe("rebuild");
    expect(prompt?.defaultId).toBe("rebuild");
    expect(prompt?.options.map(option => option.id)).toEqual(["rebuild", "continue-stale", "skip"]);
    expect(formatProjectMapFreshnessSummary(stale)).toContain("Changed: 1");
    expect(formatProjectMapFreshnessSummary(stale)).toContain("src/old.ts");
  });
});
