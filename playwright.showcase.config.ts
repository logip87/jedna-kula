import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  grep: /@showcase/,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
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
      name: "showcase-android",
      grepInvert: /@visual/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "smoke-chromium",
      testMatch: "e2e/app.spec.ts",
      grep: /@smoke/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "smoke-firefox",
      testMatch: "e2e/app.spec.ts",
      grep: /@smoke/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "smoke-iphone",
      testMatch: "e2e/app.spec.ts",
      grep: /@smoke/,
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    // Per-OS baselines. The visual job uses macOS; Linux runs the functional suite.
    ...(process.platform === "darwin"
      ? [
          {
            name: "visual-chromium",
            testMatch: "visual/**/*.spec.ts",
            use: {
              ...devices["Desktop Chrome"],
              viewport: { width: 393, height: 852 },
              deviceScaleFactor: 1,
            },
          },
        ]
      : []),
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
