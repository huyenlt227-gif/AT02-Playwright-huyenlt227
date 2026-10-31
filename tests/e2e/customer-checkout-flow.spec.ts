import { test, expect } from '../../fixtures/authenticated-user.fixture';
import { JsonHelper } from '../../utils/json-helper';

const cartData = JsonHelper.readData<{
  productA: { slug: string; name: string };
  productB: { slug: string; name: string };
}>('cart/cart-data.json');

const shippingData = JsonHelper.readData<{
  addressIndex: number;
  note: string;
}>('checkout/shipping-data.json');

const paymentData = JsonHelper.readData<{
  additionalInfo: string;
  agreeToTerms: boolean;
}>('checkout/payment-data.json');

/**
 * Full End-to-End Customer Checkout Flow.
 *
 * Login (via saved session) -> add product A -> add product B -> cart ->
 * shipping -> delivery -> payment -> confirmation -> order code verified.
 */
test.describe('Customer Checkout End-to-End Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('Run the full flow from login to order confirmation', async ({
    userSession,
    productPage,
    cartPage,
    shippingPage,
    deliveryPage,
    paymentPage,
    confirmationPage,
    log,
  }) => {
    await test.step('Login successful (saved session is valid)', async () => {
      expect(userSession).toBe(true);
      log.info('User session is valid - login step passed');
    });

    await test.step('Select product A and add it to the cart', async () => {
      await productPage.open(cartData.productA.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
    });

    await test.step('Select product B and add it to the cart', async () => {
      await productPage.open(cartData.productB.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
    });

    await test.step('Open the cart and verify both selected products', async () => {
      await cartPage.open();
      await cartPage.expectProductInCart(cartData.productA.name);
      await cartPage.expectProductInCart(cartData.productB.name);
    });

    await test.step('Proceed through Shipping Info', async () => {
      await cartPage.proceedToCheckout();
      await shippingPage.selectFirstAddress();
      await shippingPage.continueToDeliveryInfo();
    });

    await test.step('Proceed through Delivery Info', async () => {
      await deliveryPage.selectFirstDeliveryOption();
      await deliveryPage.continueToPayment();
    });

    await test.step('Complete the Payment step', async () => {
      await paymentPage.expectPaymentStep();
      await paymentPage.enterAdditionalInfo(paymentData.additionalInfo);
      if (paymentData.agreeToTerms) {
        await paymentPage.agreeToTerms();
      }
      await paymentPage.completeOrder();
    });

    await test.step('Verify the Confirmation page and the order code', async () => {
      await confirmationPage.expectConfirmation();
      const orderCode = await confirmationPage.expectOrderCodeNotEmpty();
      log.info(`Order code: ${orderCode}`);
      expect(orderCode.trim().length).toBeGreaterThan(0);
    });
  });
});