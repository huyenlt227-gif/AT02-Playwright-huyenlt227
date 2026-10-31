import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';

/**
 * Checkout step 5 - Confirmation.
 *
 * Displays the success message and the order code after the order is placed.
 */
export class ConfirmationPage extends BasePage {
  private readonly successTitle = this.page.locator('h1:has-text("Thank You for Your Order!")');
  private readonly orderCodeCandidates = [
    this.page.locator('text=/Order Code[\\s\\S]*?([A-Z0-9]{6,})/'),
    this.page.locator('text=/order code[\\s\\S]*?([A-Z0-9]{6,})/i'),
    this.page.locator('.order-code, #order-code, .code'),
    this.page.locator('h1, h2, h3, h4, strong'),
  ];

  /**
   * Asserts the confirmation page is displayed.
   */
  async expectConfirmation(): Promise<void> {
    await this.expectVisible(this.successTitle, 'Confirmation page is NOT displayed');
  }

  /**
   * Extracts the order code from the confirmation page.
   *
   * Strategy:
   *  1. look for a labelled "Order Code" value
   *  2. fall back to common code containers
   *  3. fall back to the first uppercase-alphanumeric token of 6+ chars
   */
  async getOrderCode(): Promise<string> {
    const labeled = await this.findLabeledOrderCode();
    if (labeled) {
      return labeled;
    }

    for (const candidate of this.orderCodeCandidates.slice(2)) {
      const text = await this.getTextIfPresent(candidate);
      const code = this.extractCode(text);
      if (code) {
        return code;
      }
    }

    const bodyText = await this.page.evaluate(() => document.body.innerText);
    const code = this.extractCode(bodyText);
    if (code) {
      return code;
    }

    throw new Error('Order code was not found on the confirmation page.');
  }

  /**
   * Asserts an order code is displayed and is not empty.
   */
  async expectOrderCodeNotEmpty(): Promise<string> {
    const code = await this.getOrderCode();
    expect(code.trim().length, 'Order code must not be empty').toBeGreaterThan(0);
    return code;
  }

  private async findLabeledOrderCode(): Promise<string> {
    const bodyText = await this.page.evaluate(() => document.body.innerText);
    const match = bodyText.match(/order\s*code[:\s]*([A-Z0-9][A-Z0-9\-]{5,})/i);
    return match ? match[1] : '';
  }

  private extractCode(text: string): string {
    const match = text.match(/\b[A-Z0-9][A-Z0-9\-]{5,}\b/);
    return match ? match[0] : '';
  }
}