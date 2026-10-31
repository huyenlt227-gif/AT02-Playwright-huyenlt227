import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';

/**
 * Checkout step 4 - Payment.
 *
 * The customer optionally adds a note, agrees to the terms and places the order.
 */
export class PaymentPage extends BasePage {
  private readonly additionalInfoTitle = this.page.locator('h3:has-text("Any additional info?")');
  private readonly additionalInfoInput = this.page.locator('textarea[placeholder="Type your text"]');
  private readonly termsCheckbox = this.page.locator('span.aiz-square-check');
  private readonly completeOrderButton = this.page.locator('button:has-text("Complete Order")');

  /**
   * Waits until the payment step is displayed.
   */
  async expectPaymentStep(): Promise<void> {
    await this.expectVisible(this.additionalInfoTitle, 'Payment step is NOT displayed');
  }

  /**
   * Optionally types an additional note for the order.
   */
  async enterAdditionalInfo(note: string): Promise<void> {
    if (note) {
      await this.fill(this.additionalInfoInput, note);
    }
  }

  /**
   * Accepts the terms & conditions.
   */
  async agreeToTerms(): Promise<void> {
    await this.click(this.termsCheckbox);
  }

  /**
   * Places the order.
   */
  async completeOrder(): Promise<void> {
    await this.click(this.completeOrderButton);
  }
}