import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 60000,

  reporter: [
    ['list'],
    ['monocart-reporter', {
      name: 'Test Coverage Report',
      outputFile: 'test-results/report.html',
      coverage: {
        entryFilter: (entry) => entry.url.includes('localhost:5173'),
        sourceFilter: (sourcePath) => sourcePath.includes('/src/'),
        reports: [
          ['v8'],
          ['console-summary'],
        ],
      },
    }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
  },

  workers: 1,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});