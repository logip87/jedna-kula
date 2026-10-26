import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  // Showcase retains representative product and quality scenarios, but excludes
  // the retired broad E2E matrix and all desktop-oriented visual comparisons.
  testMatch: [
    "e2e/critical/**/*.spec.ts",
    "accessibility/**/*.spec.ts",
    "pwa/**/*.spec.ts",
    "security/**/*.spec.ts",
    "resilience/**/*.spec.ts",
    "agentic/generated/**/*.spec.ts",
  ],
  grep: /@showcase/,
  // Every browser check uses the same representative phone.  Cross-browser,
  // desktop and visual-layout matrices are intentionally outside this suite.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixels: 50, animations: "disabled" },
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/showcase", open: "never" }],
  ],
  outputDir: "test-results/showcase",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
  },
  projects: [
    {
      name: "mobile-chromium",
      grepInvert: /@visual/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
