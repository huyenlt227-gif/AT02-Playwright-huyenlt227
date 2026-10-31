import { test, expect } from '../../../fixtures/base.fixture';
import { Env } from '../../../utils/env';
import { JsonHelper } from '../../../utils/json-helper';

const loginData = JsonHelper.readData<{
  invalidEmail: string;
  invalidPassword: string;
  expectedInvalidCredentialsMessage: string;
}>('login/login-data.json');

/**
 * Module 1 - Customer Login.
 *
 * These tests deliberately run WITHOUT storageState so they perform a real
 * login action. Credentials come from .env, never hardcoded.
 */
test.describe('Customer Login', () => {
  test('Login with an invalid email shows an error message', async ({ loginPage, log }) => {
    await test.step('Open the customer login page', async () => {
      await loginPage.open();
    });

    await test.step('Submit the form with an invalid email', async () => {
      const message = await loginPage.loginExpectFailure(
        loginData.invalidEmail,
        Env.CUSTOMER_PASSWORD,
      );
      log.info(`Error message received: "${message}"`);
      expect(message).toContain(loginData.expectedInvalidCredentialsMessage);
    });

    await test.step('Verify the user is still on the login page', async () => {
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });
  });

  test('Login with an invalid password shows an error message', async ({ loginPage, log }) => {
    await test.step('Open the customer login page', async () => {
      await loginPage.open();
    });

    await test.step('Submit the form with an invalid password', async () => {
      const message = await loginPage.loginExpectFailure(
        Env.CUSTOMER_EMAIL,
        loginData.invalidPassword,
      );
      log.info(`Error message received: "${message}"`);
      expect(message).toContain(loginData.expectedInvalidCredentialsMessage);
    });

    await test.step('Verify the user is still on the login page', async () => {
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });
  });

  test('Login successfully with the customer account', async ({ loginPage, log }) => {
    await test.step('Open the customer login page', async () => {
      await loginPage.open();
    });

    await test.step('Login with valid credentials from .env', async () => {
      await loginPage.loginSuccess(Env.CUSTOMER_EMAIL, Env.CUSTOMER_PASSWORD);
      log.info('Login succeeded - dashboard is displayed');
    });

    await test.step('Verify the user left the login page', async () => {
      expect(await loginPage.isOnLoginPage()).toBe(false);
    });
  });
});