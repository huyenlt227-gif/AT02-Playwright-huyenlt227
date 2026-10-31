import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';

/**
 * Customer login page - https://<site>/users/login
 */
export class LoginPage extends BasePage {
  private readonly emailInput = this.page.locator('#email');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('button:has-text("Login")');
  private readonly errorNotification = this.page.locator('[data-notify="message"]');
  private readonly loginTitle = this.page.locator('h1:has-text("Login to your account")');
  private readonly dashboardTitle = this.page.locator('h1:has-text("Dashboard")');

  /**
   * Opens the customer login page.
   */
  async open(): Promise<void> {
    await this.goto(`${Env.USER_BASE_URL}/users/login`);
    await this.closeAnnoyingPopups();
    await this.expectVisible(this.loginTitle, 'Customer login page is not displayed');
  }

  /**
   * Fills the form and submits it without asserting the outcome.
   */
  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);

    // Safety net: if a popup reappeared and swallowed the click, the form was
    // never submitted. Close the popup and retry the click once.
    await this.page.waitForTimeout(800);
    if (await this.page.locator('.website-popup').isVisible().catch(() => false)) {
      await this.closeAnnoyingPopups();
      await this.click(this.loginButton);
    }
  }

  /**
   * Logs in and asserts the dashboard is reached.
   * When login fails, the site's own error message is included in the
   * failure so the Manual Tester immediately sees the reason.
   */
  async loginSuccess(email: string, password: string): Promise<void> {
    await this.login(email, password);

    // Race the Dashboard heading against the site's rejection toast so a
    // failed login is detected immediately (the toast auto-dismisses after
    // a few seconds and would be missed by a plain dashboard wait).
    const winner = await Promise.race([
      this.dashboardTitle.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'dashboard'),
      this.errorNotification.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'toast'),
    ]);

    if (winner === 'toast' && (await this.isOnLoginPage())) {
      const siteMessage = await this.getErrorMessage();
      throw new Error(
        `Login failed: the site rejected the credentials ("${siteMessage}"). Check the .env credentials.`,
      );
    }

    await this.expectVisible(this.dashboardTitle, 'Dashboard page is NOT displayed after login');
  }

  /**
   * Attempts a login that is expected to fail and returns the error message.
   */
  async loginExpectFailure(email: string, password: string): Promise<string> {
    await this.login(email, password);
    await this.waitForVisible(this.errorNotification);
    return this.getErrorMessage();
  }

  /**
   * Returns the current error message text.
   */
  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorNotification);
  }

  /**
   * True when the browser is still on the login page.
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/users/login');
  }

  /**
   * Asserts the expected error message is shown.
   */
  async expectErrorMessage(expected: string): Promise<void> {
    await expect(this.errorNotification).toContainText(expected);
  }
}