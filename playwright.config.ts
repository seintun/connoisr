import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const includeMobileProject = isCI || process.env.PW_MOBILE === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : '50%',
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['line']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: isCI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 8_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(includeMobileProject
      ? [
          {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
          },
        ]
      : []),
  ],
  webServer: {
    command: isCI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
