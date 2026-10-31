import fs from 'fs';
import path from 'path';
import { test, expect } from '../../../fixtures/authenticated-user.fixture';
import { JsonHelper } from '../../../utils/json-helper';
import { ExcelHelper } from '../../../utils/excel-helper';
import type { ProductInfo } from '../../../utils/product-model';

const productData = JsonHelper.readData<{
  product: { slug: string; name: string };
  output: { jsonPath: string; excelPath: string };
}>('product/product-data.json');

/**
 * Module 3 - Get Product Information.
 *
 * Captures the information the website actually displays for a product and
 * saves it to JSON and Excel. Output files are suffixed with the project
 * name so parallel cross-browser runs do not overwrite each other.
 */
test.describe('Get Product Information', () => {
  test('Capture product information and save to JSON and Excel', async ({
    productPage,
    log,
  }, testInfo) => {
    let product: ProductInfo;

    await test.step('Open the product page', async () => {
      await productPage.open(productData.product.slug);
    });

    await test.step('Capture the product information', async () => {
      product = await productPage.getProductInfo();
      log.info(`Captured product: ${JSON.stringify(product, null, 2)}`);
      expect(product.name).toBeTruthy();
      expect(product.price).toBeTruthy();
    });

    await test.step('Save the information to a JSON file', async () => {
      const suffix =
        testInfo.project.name === 'chromium' ? '' : `-${testInfo.project.name}`;
      const jsonPath = productData.output.jsonPath.replace('.json', `${suffix}.json`);
      JsonHelper.write(jsonPath, product);
      expect(fs.existsSync(path.resolve(process.cwd(), jsonPath))).toBe(true);
      log.info(`JSON saved to: ${jsonPath}`);
    });

    await test.step('Save the information to an Excel file', async () => {
      const suffix =
        testInfo.project.name === 'chromium' ? '' : `-${testInfo.project.name}`;
      const excelPath = productData.output.excelPath.replace('.xlsx', `${suffix}.xlsx`);
      const savedPath = await ExcelHelper.writeProductDetails(excelPath, product);
      expect(fs.existsSync(savedPath)).toBe(true);
      log.info(`Excel saved to: ${savedPath}`);
    });
  });
});