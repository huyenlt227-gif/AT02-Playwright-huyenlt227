import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * AutoPath AI - Playwright configuration
 *
 * Project matrix:
 *  - setup-user   : logs in the customer account and saves storage/user-state.json
 *  - setup-admin  : logs in the admin account and saves storage/admin-state.json
 *  - login        : login tests - deliberately run WITHOUT storageState
 *                   (they must perform a real login action)
 *  - admin        : admin verification tests - reuse the saved admin session
 *  - chromium     : all remaining user tests + the full e2e flow - reuse the
 *                   saved customer session
 *  - firefox/webkit : stateless user tests (product, profile) to demonstrate
 *                   cross-browser support without mutating the shared account
 *
 * State safety: cart / checkout / e2e tests mutate the same customer account,
 * so those files use `test.describe.configure({ mode: 'serial' })` and the
 * demo script `npm run test:demo` runs the chromium suite with a single worker.
 */

const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT ?? 30000);
const WORKERS = process.env.CI ? 1 : Number(process.env.WORKERS ?? 2);

const desktopChrome = { ...devices['Desktop Chrome'] };
const desktopFirefox = { ...devices['Desktop Firefox'] };
const desktopWebkit = { ...devices['Desktop Safari'] };

const userStorageState = { storageState: 'storage/user-state.json' };
const adminStorageState = { storageState: 'storage/admin-state.json' };

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: WORKERS,
  timeout: 90_000,
  expect: { timeout: DEFAULT_TIMEOUT },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],

  use: {
    baseURL: process.env.USER_BASE_URL ?? 'https://cms.anhtester.com',
    // The Anh Tester demo site serves a certificate that Playwright's bundled
    // browsers do not trust. Required for the demo environment.
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: DEFAULT_TIMEOUT,
    navigationTimeout: 60_000,
  },

  projects: [
    {
      name: 'setup-user',
      testMatch: /setup\/user-auth\.setup\.ts/,
      use: { ...desktopChrome },
    },
    {
      name: 'setup-admin',
      testMatch: /setup\/admin-auth\.setup\.ts/,
      use: { ...desktopChrome },
    },
    {
      name: 'login',
      testMatch: /tests\/user\/login\/.*\.spec\.ts/,
      use: { ...desktopChrome },
    },
    {
      name: 'admin',
      testMatch: /tests\/admin\/.*\.spec\.ts/,
      use: { ...desktopChrome, ...adminStorageState },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium',
      testMatch: /tests\/user\/(?!login).*\.spec\.ts|tests\/e2e\/.*\.spec\.ts/,
      use: { ...desktopChrome, ...userStorageState },
      dependencies: ['setup-user'],
    },
    {
      name: 'firefox',
      testMatch: /tests\/user\/(product|profile)\/.*\.spec\.ts/,
      use: { ...desktopFirefox, ...userStorageState },
      dependencies: ['setup-user'],
    },
    {
      name: 'webkit',
      testMatch: /tests\/user\/(product|profile)\/.*\.spec\.ts/,
      use: { ...desktopWebkit, ...userStorageState },
      dependencies: ['setup-user'],
    },
  ],
});