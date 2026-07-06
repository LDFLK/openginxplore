import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 60000,

  retries: process.env.CI ? 2 : 0,

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
    // Takes a screenshot when a test fails
    screenshot: 'only-on-failure',
    // Records a full trace (DOM snapshots, network activity, etc) on the first retry of a failed test
    trace: 'on-first-retry',
    // (Optional) Automatically record video of failing tests
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  workers: process.env.CI ? 1 : undefined,

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