/**
 * Product information captured from the User (storefront) page.
 *
 * Fields are populated only when the website actually displays them -
 * never assumed. Unknown fields stay empty.
 */
export interface ProductInfo {
  /** Product name shown in the h1 heading. */
  name: string;
  /** Display price (discount price when present, otherwise regular price). */
  price: string;
  /** Regular (original) price, when displayed. */
  regularPrice?: string;
  /** Unit shown next to the price, e.g. "/kg". */
  unit?: string;
  /** Available quantity shown on the product page, when displayed. */
  quantity?: string;
  /** Category / breadcrumb text, when displayed. */
  category?: string;
  /** Product code: hidden product id or the URL slug. */
  productCode?: string;
  /** Full URL of the product page. */
  url?: string;
  /** Timestamp of the capture. */
  capturedAt?: string;
}