import { test, expect } from '../../fixtures/admin.fixture';
import { JsonHelper } from '../../utils/json-helper';
import { ProductComparator } from '../../utils/product-comparator';
import type { ProductInfo } from '../../utils/product-model';

const productData = JsonHelper.readData<{
  product: { slug: string; name: string };
}>('product/product-data.json');

/**
 * Module 6 - Admin Verification.
 *
 * Captures a product from the User page, then finds the same product in the
 * Admin page and compares the fields that both sides display with the same
 * meaning: name, product code / SKU and quantity.
 *
 * Price is captured and reported but not asserted: the User page shows the
 * discounted price while the Admin page shows the unit price, so a direct
 * comparison would be misleading without a normalization rule.
 */
test.describe('Admin Product Verification', () => {
  test('Compare product information between User and Admin pages', async ({
    page,
    productPage,
    adminProductPage,
    log,
  }) => {
    let userProduct: ProductInfo;
    let adminProduct: ProductInfo;

    await test.step('Capture the product information from the User page', async () => {
      await productPage.open(productData.product.slug);
      userProduct = await productPage.getProductInfo();
      log.info(`User page data: ${JSON.stringify(userProduct, null, 2)}`);
      expect(userProduct.name).toBeTruthy();
    });

    await test.step('Open the Admin product list and search for the product', async () => {
      await adminProductPage.openAllProducts();
      await adminProductPage.searchProduct(userProduct.name);
    });

    await test.step('Open the product details in the Admin page', async () => {
      await adminProductPage.openProductByName(userProduct.name, productData.product.slug);
      adminProduct = await adminProductPage.getProductInfo();
      log.info(`Admin page data: ${JSON.stringify(adminProduct, null, 2)}`);
    });

    await test.step('Compare the stable fields between the two pages', async () => {
      const results = ProductComparator.compare(userProduct, adminProduct, [
        'name',
        'productCode',
        'quantity',
      ]);
      log.info(ProductComparator.summarize(results));
      expect(
        ProductComparator.allMatched(results),
        `Product data mismatch:\n${ProductComparator.summarize(results)}`,
      ).toBe(true);
    });

    await test.step('Report the price comparison (informational)', async () => {
      const priceResults = ProductComparator.compare(userProduct, adminProduct, ['price']);
      log.info(`Price comparison (informational): ${ProductComparator.summarize(priceResults)}`);
    });
  });
});