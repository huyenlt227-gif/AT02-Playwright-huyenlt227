import { test as base, expect } from './base.fixture';
import { Env } from '../utils/env';

/**
 * Admin fixtures.
 *
 * Tests that need an authenticated admin session use this fixture file.
 * The session comes from storage/admin-state.json, produced by
 * setup/admin-auth.setup.ts and applied by the "admin" playwright project.
 */
export type AdminFixtures = {
  /**
   * Verifies that the saved admin session is valid (opening the admin panel
   * does not bounce back to the admin login page).
   */
  adminSession: boolean;
};

export const test = base.extend<AdminFixtures>({
  adminSession: async ({ page }, use) => {
    await page.goto(`${Env.USER_BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
    const bouncedToLogin = page.url().includes('/login');
    expect(
      bouncedToLogin,
      'Admin session is not valid. Re-run the setup (npx playwright test --project=setup-admin) and check the .env credentials.',
    ).toBe(false);
    await use(true);
  },
});

export { expect };