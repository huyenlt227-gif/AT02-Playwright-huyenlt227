import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';

export interface CartItem {
  name: string;
  price?: string;
  quantity?: string;
}

/**
 * Shopping cart page - https://<site>/cart
 *
 * The cart page is step 1 ("My Cart") of the 5-step checkout wizard.
 */
export class CartPage extends BasePage {
  private readonly cartSummary = this.page.locator('#cart-summary');
  private readonly emptyCartMessage = this.page.locator('h3:has-text("Your Cart is empty")');
  private readonly cartCount = this.page.locator('.cart-count');
  private readonly proceedToCheckoutButton = this.page.locator(
    'a:has-text("Continue to Shipping"), button:has-text("Continue to Shipping")',
  );
  private readonly productNameCells = this.page.locator(
    '.text-truncate-2, .cart-product-name, .product-name',
  );
  private readonly cartTableRows = this.page.locator('#cart-summary table tbody tr');

  /**
   * Opens the cart page.
   */
  async open(): Promise<void> {
    await this.goto(`${Env.USER_BASE_URL}/cart`);
    await this.closeAnnoyingPopups();
    await this.waitForVisible(this.cartSummary);
  }

  /**
   * Number shown in the cart icon in the header.
   */
  async getCartCount(): Promise<string> {
    return this.getTextIfPresent(this.cartCount);
  }

  /**
   * Names of the products currently in the cart.
   */
  async getCartProductNames(): Promise<string[]> {
    const names: string[] = [];
    const cells = await this.productNameCells.all();
    for (const cell of cells) {
      const text = ((await cell.textContent()) ?? '').trim();
      if (text) {
        names.push(text);
      }
    }
    if (names.length === 0) {
      const rows = await this.cartTableRows.all();
      for (const row of rows) {
        const text = ((await row.textContent()) ?? '').replace(/\s+/g, ' ').trim();
        if (text) {
          names.push(text);
        }
      }
    }
    return names;
  }

  /**
   * True when the cart shows the empty message.
   */
  async isEmpty(): Promise<boolean> {
    return (await this.emptyCartMessage.count()) > 0;
  }

  /**
   * Asserts that a product with the given name is present in the cart.
   */
  async expectProductInCart(name: string): Promise<void> {
    const names = await this.getCartProductNames();
    const found = names.some((n) => n.includes(name));
    expect(found, `Product "${name}" should be in the cart. Cart contains: ${names.join(', ')}`).toBeTruthy();
  }

  /**
   * Removes a product from the cart by name (used for cleanup).
   */
  async removeProduct(name: string): Promise<void> {
    const row = this.cartTableRows.filter({ hasText: name });
    if ((await row.count()) === 0) {
      return;
    }
    const removeButton = row.locator('button.remove-from-cart, .remove-from-cart, button[data-remove], .cart-remove');
    if ((await removeButton.count()) > 0) {
      await removeButton.first().click();
      await this.page.waitForTimeout(1_000);
    }
  }

  /**
   * Cleans the cart by removing every product it contains.
   */
  async clearCart(): Promise<void> {
    const rows = await this.cartTableRows.all();
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i];
      const removeButton = row.locator('button.remove-from-cart, .remove-from-cart, button[data-remove], .cart-remove');
      if ((await removeButton.count()) > 0) {
        await removeButton.first().click();
        await this.page.waitForTimeout(800);
      }
    }
  }

  /**
   * Moves to step 2 (Shipping info) of the checkout wizard.
   */
  async proceedToCheckout(): Promise<void> {
    await this.click(this.proceedToCheckoutButton);
  }
}