import { test, expect } from '../../../fixtures/authenticated-user.fixture';
import { JsonHelper } from '../../../utils/json-helper';

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
 * Module 5 - Five-Step Checkout.
 *
 * Steps: 1. My Cart -> 2. Shipping Info -> 3. Delivery Info -> 4. Payment
 *        -> 5. Confirmation (order code captured and verified).
 *
 * Scope is limited to a successful checkout that reaches Confirmation and
 * yields a non-empty order code. No refund / cancel / tracking.
 */
test.describe('Five-Step Checkout', () => {
  test.describe.configure({ mode: 'serial' });

  test('Complete the 5-step checkout and verify the order code', async ({
    productPage,
    cartPage,
    shippingPage,
    deliveryPage,
    paymentPage,
    confirmationPage,
    log,
  }) => {
    await test.step('Add the first product to the cart', async () => {
      await productPage.open(cartData.productA.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
    });

    await test.step('Add the second product to the cart', async () => {
      await productPage.open(cartData.productB.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
    });

    await test.step('Step 1 - My Cart: verify both products', async () => {
      await cartPage.open();
      await cartPage.expectProductInCart(cartData.productA.name);
      await cartPage.expectProductInCart(cartData.productB.name);
    });

    await test.step('Move to Step 2 - Shipping Info', async () => {
      await cartPage.proceedToCheckout();
      await shippingPage.selectFirstAddress();
      await shippingPage.continueToDeliveryInfo();
    });

    await test.step('Step 3 - Delivery Info: choose a delivery option', async () => {
      await deliveryPage.selectFirstDeliveryOption();
      await deliveryPage.continueToPayment();
    });

    await test.step('Step 4 - Payment: place the order', async () => {
      await paymentPage.expectPaymentStep();
      await paymentPage.enterAdditionalInfo(paymentData.additionalInfo);
      if (paymentData.agreeToTerms) {
        await paymentPage.agreeToTerms();
      }
      await paymentPage.completeOrder();
    });

    await test.step('Step 5 - Confirmation: capture and verify the order code', async () => {
      await confirmationPage.expectConfirmation();
      const orderCode = await confirmationPage.expectOrderCodeNotEmpty();
      log.info(`Order code received: ${orderCode}`);
      expect(orderCode.trim().length).toBeGreaterThan(0);
    });
  });
});