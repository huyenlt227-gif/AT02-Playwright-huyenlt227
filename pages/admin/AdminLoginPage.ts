import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';

/**
 * Admin login page - https://<site>/login
 */
export class AdminLoginPage extends BasePage {
  private readonly emailInput = this.page.locator('#email');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('button:has-text("Login")');
  private readonly loginTitle = this.page.locator('p:has-text("Login to your account")');
  private readonly adminLogo = this.page.locator('img[alt="Active eCommerce CMS"]');
  private readonly errorNotification = this.page.locator('[data-notify="message"]');

  /**
   * Opens the admin login page.
   */
  async open(): Promise<void> {
    await this.goto(`${Env.ADMIN_BASE_URL}`);
    await this.closeAnnoyingPopups();
    await this.expectVisible(this.loginTitle, 'Admin login page is not displayed');
  }

  /**
   * Logs in and asserts the admin panel is reached.
   * When login fails, the site's own error message is included in the
   * failure so the Manual Tester immediately sees the reason.
   */
  async loginSuccess(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);

    // Safety net: if a popup reappeared and swallowed the click, retry once.
    await this.page.waitForTimeout(800);
    if (await this.page.locator('.website-popup').isVisible().catch(() => false)) {
      await this.closeAnnoyingPopups();
      await this.click(this.loginButton);
    }

    // Race the admin panel logo against the site's rejection toast so a
    // failed login is detected immediately (the toast auto-dismisses quickly).
    const winner = await Promise.race([
      this.adminLogo.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'panel'),
      this.errorNotification.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'toast'),
    ]);

    if (winner === 'toast') {
      const siteMessage = await this.getText(this.errorNotification);
      throw new Error(
        `Admin login failed: the site rejected the credentials ("${siteMessage}"). Check the .env credentials.`,
      );
    }

    await this.expectVisible(this.adminLogo, 'Admin panel is NOT displayed after login');
  }

  /**
   * Attempts a login expected to fail and returns the error message.
   */
  async loginExpectFailure(email: string, password: string): Promise<string> {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForVisible(this.errorNotification);
    return this.getText(this.errorNotification);
  }
}