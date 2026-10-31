import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';

export interface ProfileData {
  name: string;
  phone: string;
  password?: string;
}

/**
 * Customer profile page (Manage Profile).
 *
 * Opened from the customer dashboard sidebar.
 */
export class ProfilePage extends BasePage {
  private readonly manageProfileMenu = this.page.locator(
    'span.aiz-side-nav-text',
    { hasText: 'Manage Profile' },
  ).locator('visible=true').first();
  private readonly manageProfileTitle = this.page.locator('h1:has-text("Manage Profile")');
  private readonly nameInput = this.page.locator('input[placeholder="Your name"]');
  private readonly phoneInput = this.page.locator('input[placeholder="Your Phone"]');
  private readonly newPasswordInput = this.page.locator('input[placeholder="New Password"]');
  private readonly confirmPasswordInput = this.page.locator('input[placeholder="Confirm Password"]');
  private readonly updateButton = this.page.locator('button:has-text("Update Profile")');
  private readonly notification = this.page.locator('[data-notify="message"]');

  /**
   * Opens the Manage Profile screen using the authenticated session.
   */
  async open(): Promise<void> {
    await this.goto(`${Env.USER_BASE_URL}/dashboard`);
    await this.closeAnnoyingPopups();
    await this.click(this.manageProfileMenu);
    await this.expectVisible(this.manageProfileTitle, 'Manage Profile page is NOT displayed');
  }

  /**
   * Updates the profile with the given data and returns the system message.
   *
   * NOTE: the demo site may reply "Sorry! the action is not permitted in demo"
   * instead of persisting the change - the returned message tells the caller
   * which case happened.
   */
  async updateProfile(data: ProfileData): Promise<string> {
    await this.fill(this.nameInput, data.name);
    await this.fill(this.phoneInput, data.phone);
    if (data.password) {
      await this.fill(this.newPasswordInput, data.password);
      await this.fill(this.confirmPasswordInput, data.password);
    }
    await this.click(this.updateButton);
    await this.waitForVisible(this.notification);
    return this.getText(this.notification);
  }

  /**
   * Current value of the name field.
   */
  async getNameValue(): Promise<string> {
    return (await this.nameInput.inputValue()).trim();
  }

  /**
   * True when the update was accepted by the demo site.
   */
  isSuccessMessage(message: string): boolean {
    return !/not permitted/i.test(message) && message.length > 0;
  }
}