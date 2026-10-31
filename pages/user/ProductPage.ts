import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';
import type { ProductInfo } from '../../utils/product-model';

/**
 * Product detail page - https://<site>/product/<slug>
 */
export class ProductPage extends BasePage {
  private readonly productTitle = this.page.locator('h1');
  private readonly regularPrice = this.page.locator('del');
  private readonly discountPrice = this.page.locator('strong.h2.fw-600.text-primary');
  private readonly unit = this.page.locator('del span.opacity-70, strong.h2.fw-600.text-primary + span.opacity-70');
  private readonly availableQuantity = this.page.locator('#available-quantity');
  private readonly quantityInput = this.page.locator('input[name="quantity"]');
  private readonly productIdInput = this.page.locator('#option-choice-form input[name="id"]');
  private readonly addToCartButton = this.page.locator('button.add-to-cart');
  private readonly buyNowButton = this.page.locator('button.buy-now');
  private readonly addToCartModal = this.page.locator('#addToCart');
  private readonly addToCartModalClose = this.page.locator('#addToCart button.close');
  private readonly breadcrumb = this.page.locator('.breadcrumb');

  /**
   * Opens a product page. Accepts a full URL or a product slug.
   */
  async open(urlOrSlug: string): Promise<void> {
    const url = urlOrSlug.startsWith('http')
      ? urlOrSlug
      : `${Env.USER_BASE_URL}/product/${urlOrSlug}`;
    await this.goto(url);
    await this.closeAnnoyingPopups();
    await this.expectVisible(this.productTitle, 'Product page is NOT displayed');
  }

  async getProductName(): Promise<string> {
    return this.getText(this.productTitle);
  }

  /**
   * Regular (original) price, e.g. "$12.00 /kg". Empty when not displayed.
   */
  async getRegularPrice(): Promise<string> {
    const text = await this.getTextIfPresent(this.regularPrice);
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Discount price, e.g. "$11.00". Empty when not displayed.
   */
  async getDiscountPrice(): Promise<string> {
    return this.getTextIfPresent(this.discountPrice);
  }

  /**
   * The price the customer actually pays: discount price when present,
   * otherwise the regular price.
   */
  async getDisplayPrice(): Promise<string> {
    const discount = await this.getDiscountPrice();
    if (discount) {
      return discount;
    }
    return this.getRegularPrice();
  }

  /**
   * Unit text next to the price (e.g. "/kg"). Empty when not displayed.
   */
  async getUnit(): Promise<string> {
    return this.getTextIfPresent(this.unit);
  }

  /**
   * Available quantity shown on the page. Empty when not displayed.
   */
  async getAvailableQuantity(): Promise<string> {
    return this.getTextIfPresent(this.availableQuantity);
  }

  /**
   * Product code: prefers the hidden product id, falls back to the URL slug.
   */
  async getProductCode(): Promise<string> {
    const id = await this.productIdInput.inputValue().catch(() => '');
    if (id) {
      return id;
    }
    const match = this.page.url().match(/\/product\/(.+)$/);
    return match ? match[1] : '';
  }

  /**
   * Breadcrumb / category text. Empty when the page has no breadcrumb.
   */
  async getCategory(): Promise<string> {
    return this.getTextIfPresent(this.breadcrumb);
  }

  /**
   * Captures everything the product page displays about the product.
   */
  async getProductInfo(): Promise<ProductInfo> {
    return {
      name: await this.getProductName(),
      price: await this.getDisplayPrice(),
      regularPrice: await this.getRegularPrice(),
      unit: await this.getUnit(),
      quantity: await this.getAvailableQuantity(),
      category: await this.getCategory(),
      productCode: await this.getProductCode(),
      url: this.page.url(),
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Adds the product to the cart. Optionally changes the quantity first.
   *
   * Behavior on this site:
   *  - products WITHOUT variants redirect straight to /cart after adding
   *  - products WITH variants open the #addToCart modal for option selection
   */
  async addToCart(quantity = 1): Promise<void> {
    if (quantity > 1) {
      await this.fill(this.quantityInput, String(quantity));
    }
    await this.click(this.addToCartButton);
    await Promise.race([
      this.addToCartModal.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}),
      this.page.waitForURL(/\/cart/, { timeout: 10_000 }).catch(() => {}),
    ]);
  }

  /**
   * Closes the "added to cart" modal if it is open.
   */
  async closeAddToCartModal(): Promise<void> {
    if (await this.addToCartModal.isVisible().catch(() => false)) {
      await this.addToCartModalClose.click().catch(() => {
        /* modal may already be closed */
      });
    }
  }

  /**
   * Asserts the product title equals the expected name.
   */
  async expectProductName(expected: string): Promise<void> {
    await expect(this.productTitle).toHaveText(expected);
  }
}