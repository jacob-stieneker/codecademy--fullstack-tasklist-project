import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Run the same behavior checks against optimized files instead of the development server.
export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4300' },
  outputDir: 'test-results/build',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/build', open: 'never' }]],
  webServer: {
    command: 'node scripts/preview-build.mjs',
    url: 'http://127.0.0.1:4300',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
