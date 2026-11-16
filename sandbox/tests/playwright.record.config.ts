import { defineConfig, devices } from '@playwright/test';

/** Records the successful five-beat demo. Saved under test-results/ (gitignored). */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'recording.spec.ts',
  reporter: 'list',
  outputDir: 'demo-backup',
  use: {
    baseURL: 'http://localhost:3000',
    video: 'on',
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'record', use: { ...devices['Desktop Chrome'] } }],
});
