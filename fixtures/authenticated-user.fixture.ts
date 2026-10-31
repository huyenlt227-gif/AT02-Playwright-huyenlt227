import { test as base, expect } from './base.fixture';
import { Env } from '../utils/env';

/**
 * Authenticated user fixtures.
 *
 * Tests that need a logged-in customer session use this fixture file.
 * The session itself comes from storage/user-state.json, which is produced
 * by setup/user-auth.setup.ts and applied by the playwright projects.
 */
export type AuthenticatedUserFixtures = {
  /**
   * Verifies that the saved user session is valid (visiting the home page
   * does not bounce back to the login page).
   */
  userSession: boolean;
};

export const test = base.extend<AuthenticatedUserFixtures>({
  userSession: async ({ page }, use) => {
    await page.goto(`${Env.USER_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const bouncedToLogin = page.url().includes('/users/login');
    expect(
      bouncedToLogin,
      'User session is not valid. Re-run the setup (npx playwright test --project=setup-user) and check the .env credentials.',
    ).toBe(false);
    await use(true);
  },
});

export { expect };