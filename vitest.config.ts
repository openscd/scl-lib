import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Only *.spec.ts are tests; *.test.ts files are shared helpers.
    include: ["**/*.spec.ts"],
    // Keep a small worker pool (>1). A single worker (maxWorkers:1) deadlocks in
    // @vitest/browser 4.x, and full parallelism increases iframe-load races; 3 is
    // a stable middle ground.
    maxWorkers: 3,
    minWorkers: 1,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
      // Reuse one page context across test files rather than tearing down and
      // recreating an iframe per file. The per-file iframe churn is what races
      // and intermittently drops connections ("Cannot connect to the iframe"),
      // silently zeroing out random files. Single-worker configs (maxWorkers:1
      // or fileParallelism:false) deadlock in @vitest/browser 4.x, so they are
      // not an option.
      isolate: false,
    },
    coverage: {
      // Always collect coverage, even without the --coverage flag.
      enabled: true,
      provider: "v8",
      include: ["**/*.ts"],
      exclude: [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.testfiles.ts",
        "vitest.config.ts",
        "index.ts",
      ],
      reporter: ["text", "html", "lcov"],
      // Only report files that still have gaps; fully covered files are hidden.
      skipFull: true,
      // Ratchet: pinned to current coverage so it can't regress.
      thresholds: {
        autoUpdate: true,
        statements: 99.73,
        branches: 98.23,
        functions: 100,
        lines: 99.95,
      },
    },
  },
});
