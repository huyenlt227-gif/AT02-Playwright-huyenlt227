import type { ProductInfo } from './product-model';

export interface FieldComparison {
  field: string;
  userValue: string | undefined;
  adminValue: string | undefined;
  matched: boolean;
}

/**
 * Compares product data captured from the User page with the same product
 * viewed in the Admin page.
 *
 * Only fields that both sides display with the same meaning should be
 * compared (name, code/SKU, price, category, quantity/status).
 */
export class ProductComparator {
  /**
   * Compares the given fields between the two captures.
   */
  static compare(
    userProduct: ProductInfo,
    adminProduct: ProductInfo,
    fields: (keyof ProductInfo)[],
  ): FieldComparison[] {
    return fields.map((field) => {
      const userProductRecord = userProduct as unknown as Record<string, unknown>;
      const adminProductRecord = adminProduct as unknown as Record<string, unknown>;
      const userValue = userProductRecord[field as string] as string | undefined;
      const adminValue = adminProductRecord[field as string] as string | undefined;
      return {
        field: field as string,
        userValue,
        adminValue,
        matched: ProductComparator.normalize(userValue) === ProductComparator.normalize(adminValue),
      };
    });
  }

  /**
   * True when every compared field matched.
   */
  static allMatched(results: FieldComparison[]): boolean {
    return results.length > 0 && results.every((r) => r.matched);
  }

  /**
   * Human readable summary, e.g.
   *   "name: user='test' vs admin='test' -> MATCHED"
   */
  static summarize(results: FieldComparison[]): string {
    return results
      .map(
        (r) =>
          `${r.field}: user='${r.userValue ?? ''}' vs admin='${r.adminValue ?? ''}' -> ${
            r.matched ? 'MATCHED' : 'MISMATCH'
          }`,
      )
      .join('\n');
  }

  /**
   * Normalizes a value for comparison: trims, collapses whitespace,
   * lowercases and strips currency symbols.
   */
  static normalize(value: string | undefined): string {
    if (value === undefined || value === null) {
      return '';
    }
    return value
      .replace(/[$,\s]/g, '')
      .trim()
      .toLowerCase();
  }
}