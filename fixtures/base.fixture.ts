import { test as base, expect } from '@playwright/test';
import { TestLogger } from '../utils/logger';
import { LoginPage } from '../pages/user/LoginPage';
import { ProfilePage } from '../pages/user/ProfilePage';
import { ProductPage } from '../pages/user/ProductPage';
import { CartPage } from '../pages/user/CartPage';
import { ShippingPage } from '../pages/user/ShippingPage';
import { DeliveryPage } from '../pages/user/DeliveryPage';
import { PaymentPage } from '../pages/user/PaymentPage';
import { ConfirmationPage } from '../pages/user/ConfirmationPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminProductPage } from '../pages/admin/AdminProductPage';

/**
 * Shared fixtures.
 *
 * Every Page Object is provided out of the box, so a Manual Tester does not
 * need to instantiate pages inside a test:
 *
 *   test('...', async ({ loginPage }) => { ... });
 */
export type AppFixtures = {
  loginPage: LoginPage;
  profilePage: ProfilePage;
  productPage: ProductPage;
  cartPage: CartPage;
  shippingPage: ShippingPage;
  deliveryPage: DeliveryPage;
  paymentPage: PaymentPage;
  confirmationPage: ConfirmationPage;
  adminLoginPage: AdminLoginPage;
  adminProductPage: AdminProductPage;
  /** Per-test file logger writing to logs/<date>/<test-title>.log */
  log: TestLogger;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  shippingPage: async ({ page }, use) => {
    await use(new ShippingPage(page));
  },
  deliveryPage: async ({ page }, use) => {
    await use(new DeliveryPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  adminProductPage: async ({ page }, use) => {
    await use(new AdminProductPage(page));
  },
  log: async ({}, use, testInfo) => {
    const logger = new TestLogger(testInfo.title);
    await use(logger);
    logger.info('TEST FINISHED');
  },
});

export { expect };