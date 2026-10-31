import { expect } from '@playwright/test';
import { BasePage } from '../common/BasePage';
import { Env } from '../../utils/env';
import type { ProductInfo } from '../../utils/product-model';

/**
 * Admin product pages: the product list and the product detail/edit screen.
 */
export class AdminProductPage extends BasePage {
  private readonly productsMenu = this.page.locator('span.aiz-side-nav-text, .aiz-side-nav-link', {
    hasText: 'Products',
  });
  private readonly allProductsMenuItem = this.page.locator(
    'span.aiz-side-nav-text, .aiz-side-nav-link',
    { hasText: 'All products' },
  );
  private readonly searchInput = this.page.locator('#search');
  private readonly productNameCells = this.page.locator('span.text-muted.text-truncate-2');
  private readonly productNameInput = this.page.locator('input[placeholder="Product Name"]');
  private readonly unitPriceInput = this.page.locator('input[placeholder="Unit price"]');
  private readonly quantityInput = this.page.locator('input[placeholder="Quantity"]');
  private readonly skuInput = this.page.locator('input[placeholder="SKU"]');
  private readonly categoryButton = this.page.locator('button[data-id="category_id"]');

  /**
   * Opens the admin product list via the sidebar.
   */
  async openAllProducts(): Promise<void> {
    await this.goto(`${Env.USER_BASE_URL}/admin/products/all`);
    await this.closeAnnoyingPopups();
    // Fallback: navigate through the sidebar when the direct URL does not work.
    if (!this.page.url().includes('/admin/products')) {
      await this.click(this.productsMenu);
      await this.click(this.allProductsMenuItem);
    }
    await this.searchInput.waitFor({ state: 'visible' });
  }

  /**
   * Searches for a product by name in the admin product list.
   */
  async searchProduct(name: string): Promise<void> {
    await this.fill(this.searchInput, name);
    await this.searchInput.press('Enter');
    await this.page.waitForTimeout(1_500);
  }

  /**
   * Opens the first product whose name contains the given text.
   */
  async openProductByName(name: string, slug?: string): Promise<void> {
    // Several products can share the same name, so prefer matching the exact
    // product slug from the row's "View" link when it is provided.
    const nameCell = this.page.locator('span.text-muted.text-truncate-2', { hasText: name });
    let row = this.page.locator('table tbody tr').filter({ has: nameCell });
    if (slug) {
      row = row.filter({ has: this.page.locator(`a[title="View"][href$="/product/${slug}"]`) });
    }
    row = row.first();
    const nextPage = this.page.locator('a.page-link[rel="next"]');
    // Results are paginated: keep paging until the matching row appears.
    while ((await row.count()) === 0 && (await nextPage.count()) > 0) {
      await nextPage.first().click();
      await this.page.waitForTimeout(1_500);
    }
    await row.waitFor({ state: 'visible' });
    await row.locator('a[title="Edit"]').click();
    await this.productNameInput.waitFor({ state: 'visible' });
  }

  /**
   * Captures product data from the admin product detail screen.
   */
  async getProductInfo(): Promise<ProductInfo> {
    const name = await this.getInputValue(this.productNameInput);
    const price = await this.getInputValue(this.unitPriceInput);
    const quantity = await this.getInputValue(this.quantityInput);
    // The User page exposes the product ID as the product code, so mirror it
    // here from the edit URL; fall back to the SKU field when absent.
    const idFromUrl = this.page.url().match(/\/products\/admin\/(\d+)\/edit/)?.[1] ?? '';
    const productCode = idFromUrl || (await this.getInputValue(this.skuInput));
    const category = await this.getTextIfPresent(this.categoryButton);
    return {
      name,
      price: price ? `$${price}` : '',
      quantity,
      productCode,
      category,
      url: this.page.url(),
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Asserts the admin product detail screen shows the expected name.
   */
  async expectProductName(expected: string): Promise<void> {
    await expect(this.productNameInput).toHaveValue(expected);
  }

  private async getInputValue(locator: ReturnType<typeof this.page.locator>): Promise<string> {
    if ((await locator.count()) === 0) {
      return '';
    }
    return ((await locator.inputValue().catch(() => '')) ?? '').trim();
  }
}