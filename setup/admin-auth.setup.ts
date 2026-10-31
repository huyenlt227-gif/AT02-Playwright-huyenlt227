import { test as setup } from '@playwright/test';
import { Env } from '../utils/env';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';

/**
 * Authentication setup: logs in the admin account and saves the session
 * to storage/admin-state.json so admin tests can reuse it.
 */
setup('authenticate as admin', async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  await adminLoginPage.open();
  await adminLoginPage.loginSuccess(Env.ADMIN_EMAIL, Env.ADMIN_PASSWORD);
  await page.context().storageState({ path: 'storage/admin-state.json' });
});