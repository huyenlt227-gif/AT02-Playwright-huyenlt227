import { test, expect } from '../../../fixtures/authenticated-user.fixture';
import { JsonHelper } from '../../../utils/json-helper';

const cartData = JsonHelper.readData<{
  productA: { slug: string; name: string };
  productB: { slug: string; name: string };
}>('cart/cart-data.json');

/**
 * Module 4 - Add Two Products to Cart.
 *
 * Serial mode: this test mutates the shared customer cart, so it must not
 * run in parallel with other cart-mutating tests.
 */
test.describe('Add Two Products to Cart', () => {
  test.describe.configure({ mode: 'serial' });

  test('Add two products to the cart and verify both', async ({
    productPage,
    cartPage,
    log,
  }) => {
    await test.step('Add the first product to the cart', async () => {
      await productPage.open(cartData.productA.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
      log.info(`Added product A: ${cartData.productA.name}`);
    });

    await test.step('Add the second product to the cart', async () => {
      await productPage.open(cartData.productB.slug);
      await productPage.addToCart();
      await productPage.closeAddToCartModal();
      log.info(`Added product B: ${cartData.productB.name}`);
    });

    await test.step('Open the cart and verify both products are displayed', async () => {
      await cartPage.open();
      await cartPage.expectProductInCart(cartData.productA.name);
      await cartPage.expectProductInCart(cartData.productB.name);
      log.info('Both products are displayed in the cart');
    });

    await test.step('Clean up the cart', async () => {
      await cartPage.clearCart();
      log.info('Cart cleaned up');
    });
  });
});