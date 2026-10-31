import { BasePage } from '../common/BasePage';

/**
 * Checkout step 3 - Delivery Info.
 *
 * The customer chooses a delivery option and moves to payment.
 */
export class DeliveryPage extends BasePage {
  private readonly deliveryOptions = this.page.locator(
    'input[name="delivery_type"], input[type="radio"]',
  );
  private readonly continueButton = this.page.locator(
    'button:has-text("Continue to Payment")',
  );

  /**
   * Selects the first available delivery option.
   */
  async selectFirstDeliveryOption(): Promise<void> {
    const options = this.deliveryOptions;
    if ((await options.count()) > 0) {
      await options.first().check({ force: true });
    }
  }

  /**
   * Moves to step 4 (Payment).
   */
  async continueToPayment(): Promise<void> {
    await this.click(this.continueButton);
  }
}