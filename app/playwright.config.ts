import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3001",
    headless: !!process.env.TEST_BASE_URL,
  },
});
