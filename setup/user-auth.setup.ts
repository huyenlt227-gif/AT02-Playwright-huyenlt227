import { test as setup } from '@playwright/test';
import { Env } from '../utils/env';
import { LoginPage } from '../pages/user/LoginPage';

/**
 * Authentication setup: logs in the customer account and saves the session
 * to storage/user-state.json so other tests can reuse it.
 */
setup('authenticate as customer', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginSuccess(Env.CUSTOMER_EMAIL, Env.CUSTOMER_PASSWORD);
  await page.context().storageState({ path: 'storage/user-state.json' });
});