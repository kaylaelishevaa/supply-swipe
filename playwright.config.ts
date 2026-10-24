import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./generated-artifacts/test-results",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:80",
    viewport: { width: 390, height: 844 },
    headless: true,
    launchOptions: {
      executablePath: process.env.REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ["--no-sandbox"],
    },
    screenshot: "only-on-failure",
  },
});
