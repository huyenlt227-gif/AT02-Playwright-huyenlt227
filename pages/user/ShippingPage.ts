import { BasePage } from '../common/BasePage';

/**
 * Checkout step 2 - Shipping Info.
 *
 * The customer selects (or enters) a shipping address and continues.
 */
export class ShippingPage extends BasePage {
  private readonly addressOptions = this.page.locator('span.aiz-rounded-check');
  private readonly continueButton = this.page.locator(
    'button:has-text("Continue to Delivery Info")',
  );

  /**
   * Selects the first available saved address.
   */
  async selectFirstAddress(): Promise<void> {
    await this.addressOptions.first().waitFor({ state: 'visible' });
    await this.addressOptions.first().click();
  }

  /**
   * Selects the address at the given index (0-based).
   */
  async selectAddress(index: number): Promise<void> {
    await this.addressOptions.nth(index).waitFor({ state: 'visible' });
    await this.addressOptions.nth(index).click();
  }

  /**
   * Moves to step 3 (Delivery info).
   */
  async continueToDeliveryInfo(): Promise<void> {
    await this.click(this.continueButton);
  }
}