import ExcelJS from 'exceljs';
import path from 'path';
import type { ProductInfo } from './product-model';

/**
 * Excel (.xlsx) export helpers.
 *
 * Lets the product-information test save captured product data to an Excel
 * file in addition to (or instead of) JSON.
 */
export class ExcelHelper {
  /**
   * Writes a list of flat objects as a worksheet.
   * Keys become the header row.
   */
  static async writeRows(
    filePath: string,
    sheetName: string,
    rows: Record<string, unknown>[],
  ): Promise<string> {
    if (rows.length === 0) {
      throw new Error('Cannot write an empty dataset to Excel.');
    }

    const fullPath = path.resolve(process.cwd(), filePath);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    const headers = Object.keys(rows[0]);
    sheet.addRow(headers);
    for (const row of rows) {
      sheet.addRow(headers.map((h) => row[h]));
    }

    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = Math.max(12, String(column.header ?? '').length + 4);
    });

    await workbook.xlsx.writeFile(fullPath);
    return fullPath;
  }

  /**
   * Convenience wrapper: writes a single ProductInfo object to an .xlsx file.
   */
  static async writeProductDetails(
    filePath: string,
    product: ProductInfo,
  ): Promise<string> {
    return ExcelHelper.writeRows(
      filePath,
      'Product Details',
      [product as unknown as Record<string, unknown>],
    );
  }
}