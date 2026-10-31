import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Base class for every Page Object.
 *
 * Centralizes the actions every page needs:
 *  - navigation
 *  - dismissing the demo popups (website popup + cookie banner)
 *  - safe text / click / fill helpers
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected readonly websitePopupClose = this.page.locator(
    '.website-popup button.set-session',
  );
  protected readonly cookieAcceptButton = this.page.locator(
    'button.aiz-cookie-accept',
  );

  /**
   * Navigates to a URL and waits for the DOM to be ready.
   */
  protected async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Closes the "Website Demo" popup and the cookie banner if they appear.
   * These overlays otherwise intercept clicks on the page.
   */
  async closeAnnoyingPopups(): Promise<void> {
    // The "Website Demo" popup is injected by the page JS shortly after load.
    // Wait for it to appear first, otherwise it shows up later and intercepts
    // clicks on the page (e.g. the Login button).
    try {
      await this.websitePopupClose.first().waitFor({ state: 'attached', timeout: 3_000 });
    } catch {
      /* popup not present on this page */
    }

    // Close it through its close button (persists the dismissal for the session).
    if ((await this.websitePopupClose.count()) > 0) {
      await this.websitePopupClose
        .first()
        .click({ timeout: 5_000 })
        .catch(() => {
          /* popup may already be gone */
        });
      await this.page.waitForTimeout(600);
    }

    // Safety net: if the popup is still visible, remove it from the DOM so it
    // can never intercept clicks.
    if (await this.page.locator('.website-popup').isVisible().catch(() => false)) {
      await this.page
        .locator('.website-popup')
        .evaluate((el) => el.remove())
        .catch(() => {
          /* already removed */
        });
    }

    // Cookie banner.
    if ((await this.cookieAcceptButton.count()) > 0) {
      await this.cookieAcceptButton
        .first()
        .click({ timeout: 3_000 })
        .catch(() => {
          /* banner may already be gone */
        });
    }
  }

  /**
   * Waits until the locator is visible, then returns its trimmed text.
   */
  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return ((await locator.textContent()) ?? '').trim();
  }

  /**
   * Returns the trimmed text of a locator without waiting for visibility.
   * Returns an empty string when the element does not exist.
   */
  protected async getTextIfPresent(locator: Locator): Promise<string> {
    if ((await locator.count()) === 0) {
      return '';
    }
    return ((await locator.first().textContent()) ?? '').trim();
  }

  /**
   * Asserts that a locator is visible. Produces a readable failure message.
   */
  protected async expectVisible(
    locator: Locator,
    description: string,
  ): Promise<void> {
    await expect(locator, description).toBeVisible();
  }

  /**
   * Waits for a locator to be visible (used before interacting).
   */
  protected async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Clicks a locator after waiting for it to be actionable.
   */
  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Fills a locator after waiting for it to be visible.
   */
  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }
}