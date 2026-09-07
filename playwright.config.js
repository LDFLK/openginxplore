import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 60000,

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', {
    outputFolder: 'playwright-report',
    open: 'never',
    }],
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

  workers: process.env.CI ? 1 : 2,

  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7 landscape'] },
    },
    {
      name: 'chromium-tablet',
      use: { ...devices['Galaxy Tab S4 landscape'] },
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'firefox-tablet',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1024, height: 768 } }, // swapped to landscape too, for consistency
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14 landscape'] },
    },
    {
      name: 'webkit-tablet',
      use: { ...devices['iPad Pro 11 landscape'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
    },
  ],
});