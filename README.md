# AutoPath AI

**AI-supported Playwright Automation Framework for Manual Testers**

AutoPath AI is an AI-supported Playwright Automation Framework that helps Manual
Testers begin their automation journey through a real e-commerce testing
project. The framework covers customer login, profile updates, product data
extraction, cart operations, five-step checkout, order-code verification, and
product comparison between User and Admin pages. It applies Page Object Model,
Playwright Fixtures, storageState, external test data, parallel execution,
cross-browser testing, and failure evidence including reports, logs,
screenshots, videos, and traces. AI acts as a learning and coding assistant
that explains, guides, reviews, and helps debug the framework, while the
tester remains responsible for validating the generated code and test results.

> **Bản tiếng Việt:** AutoPath AI là Playwright Automation Framework có AI hỗ
> trợ, giúp Manual Tester bắt đầu hành trình automation thông qua một dự án
> kiểm thử e-commerce thực tế. Framework bao gồm kiểm thử đăng nhập, cập nhật
> hồ sơ, lấy và lưu thông tin sản phẩm, thêm hai sản phẩm vào giỏ hàng, thực
> hiện năm bước checkout, kiểm tra mã đơn hàng và đối chiếu thông tin sản phẩm
> giữa User Page và Admin Page. Dự án áp dụng Page Object Model, Playwright
> Fixtures, storageState, quản lý test data bên ngoài, chạy song song,
> cross-browser và lưu evidence khi test thất bại. AI đóng vai trò giải thích,
> hướng dẫn, review và hỗ trợ debug; Manual Tester vẫn chịu trách nhiệm kiểm
> tra code và xác nhận kết quả.

---

## Table of contents

1. [Target website](#target-website)
2. [Business modules covered](#business-modules-covered)
3. [Project structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Configuration (.env)](#configuration-env)
6. [Running the tests](#running-the-tests)
7. [How the framework works (for Manual Testers)](#how-the-framework-works-for-manual-testers)
8. [Evidence when a test fails](#evidence-when-a-test-fails)
9. [AI support in this project](#ai-support-in-this-project)
10. [Suggested demo flow](#suggested-demo-flow)
11. [Troubleshooting](#troubleshooting)

---

## Target website

| Area | URL |
| --- | --- |
| User (storefront) | `https://cms.anhtester.com` |
| Customer login | `https://cms.anhtester.com/users/login` |
| Admin login | `https://cms.anhtester.com/login` |

The target is the **Active eCommerce CMS demo** maintained by Anh Tester, a
well-known practice site for automation testing in Vietnam.

> **Demo accounts.** The demo site resets its data periodically. The documented
> demo accounts are `customer@example.com` / `123456` and
> `admin@example.com` / `123456`. If login returns *"Invalid login
> credentials"*, the demo data has been reset - fill the current valid
> credentials in `.env` (see [Troubleshooting](#troubleshooting)).

---

## Business modules covered

| # | Module | Test file | Key assertions |
| --- | --- | --- | --- |
| 1 | Customer Login | `tests/user/login/login.spec.ts` | invalid email, invalid password, successful login (no storageState - a real login is performed) |
| 2 | Manage Profile | `tests/user/profile/update-profile.spec.ts` | profile update action completes; change is reverted afterwards |
| 3 | Get Product Information | `tests/user/product/get-product-information.spec.ts` | product name & price captured; saved to JSON **and** Excel |
| 4 | Add Two Products to Cart | `tests/user/cart/add-two-products.spec.ts` | both selected products are displayed in the cart |
| 5 | Five-Step Checkout | `tests/user/checkout/checkout.spec.ts` | My Cart → Shipping Info → Delivery Info → Payment → Confirmation; order code is displayed and non-empty |
| 6 | Admin Verification | `tests/admin/verify-product-detail.spec.ts` | product name, code/SKU and quantity match between User and Admin pages |
| 7 | Full E2E Flow | `tests/e2e/customer-checkout-flow.spec.ts` | login → add 2 products → cart → shipping → delivery → payment → confirmation → order code |

### Checkout scope (important limitation)

The framework stops **after the order code is captured and verified**. It does
**not** cover refund, cancel order, return, shipment tracking, real payment
gateways, or database validation.

---

## Project structure

```
autopath-ai/
├── pages/                     # Page Object Model
│   ├── common/BasePage.ts     # shared navigation / popup / text helpers
│   ├── user/                  # storefront pages
│   │   ├── LoginPage.ts
│   │   ├── ProfilePage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   ├── ShippingPage.ts
│   │   ├── DeliveryPage.ts
│   │   ├── PaymentPage.ts
│   │   └── ConfirmationPage.ts
│   └── admin/
│       ├── AdminLoginPage.ts
│       └── AdminProductPage.ts
├── fixtures/                  # Playwright fixtures (page objects ready-made)
│   ├── base.fixture.ts
│   ├── authenticated-user.fixture.ts
│   └── admin.fixture.ts
├── tests/
│   ├── user/
│   │   ├── login/login.spec.ts
│   │   ├── profile/update-profile.spec.ts
│   │   ├── product/get-product-information.spec.ts
│   │   ├── cart/add-two-products.spec.ts
│   │   └── checkout/checkout.spec.ts
│   ├── admin/verify-product-detail.spec.ts
│   └── e2e/customer-checkout-flow.spec.ts
├── data/                      # external test data (kept out of test code)
│   ├── login/login-data.json
│   ├── profile/profile-data.json
│   ├── cart/cart-data.json
│   ├── product/product-data.json
│   └── checkout/{shipping-data,payment-data}.json
├── utils/
│   ├── env.ts                 # typed access to .env
│   ├── logger.ts              # per-test file logger
│   ├── json-helper.ts
│   ├── excel-helper.ts
│   ├── product-model.ts
│   └── product-comparator.ts
├── setup/
│   ├── user-auth.setup.ts     # login customer → storage/user-state.json
│   └── admin-auth.setup.ts    # login admin → storage/admin-state.json
├── storage/                   # saved sessions (git-ignored)
├── output/products/           # captured product data (git-ignored)
├── logs/                      # per-test logs (git-ignored)
├── test-results/              # screenshots / videos / traces (git-ignored)
├── playwright-report/         # HTML report (git-ignored)
├── .env.example
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Prerequisites

- **Node.js 18+** (developed on Node 20)
- **npm** (or pnpm / yarn)

Install dependencies:

```bash
npm install
```

Playwright browsers are downloaded automatically on first run:

```bash
npx playwright install
```

---

## Configuration (.env)

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable | Meaning |
| --- | --- |
| `USER_BASE_URL` | storefront base URL (default `https://cms.anhtester.com`) |
| `ADMIN_BASE_URL` | admin login URL (default `https://cms.anhtester.com/login`) |
| `CUSTOMER_EMAIL` / `CUSTOMER_PASSWORD` | customer account used by authenticated tests |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin account used by admin tests |
| `DEFAULT_TIMEOUT` | global timeout in ms (default `30000`) |
| `WORKERS` | parallel workers (default `2`, forced to `1` on CI) |

> **Security:** never commit `.env` or the `storage/` folder. Sessions saved in
> `storage/` may contain sensitive information. Both are already git-ignored.

---

## Running the tests

```bash
# everything (setup + all projects)
npm test

# one module at a time
npm run test:login
npm run test:profile
npm run test:product
npm run test:cart
npm run test:checkout
npm run test:admin
npm run test:e2e

# cross-browser (chromium + firefox + webkit)
npm run test:all-browsers

# the demo sequence - runs the chromium suite serially so cart-mutating
# tests never overwrite each other's state
npm run test:demo

# open the HTML report after a run
npm run report

# typecheck the framework
npm run typecheck
```

### Project matrix

| Project | What runs | storageState |
| --- | --- | --- |
| `setup-user` | login customer → save session | - |
| `setup-admin` | login admin → save session | - |
| `login` | `tests/user/login/*` | **none** (real login) |
| `admin` | `tests/admin/*` | `storage/admin-state.json` |
| `chromium` | all other user tests + e2e | `storage/user-state.json` |
| `firefox` / `webkit` | product + profile tests (stateless) | `storage/user-state.json` |

**Why firefox/webkit only run the stateless tests?** Cart, checkout and e2e
tests mutate the same customer account (cart contents, orders). Running them on
three browsers in parallel would make the browsers overwrite each other's
state. The stateless tests (product info, profile) demonstrate cross-browser
support safely. Stateful tests run on chromium and use `serial` mode.

---

## How the framework works (for Manual Testers)

### Page Object Model (POM)

Every screen is a **Page Object** class under `pages/`. The page object owns the
locators and the business actions of that screen. Tests call business methods,
never raw selectors:

```ts
// pages/user/LoginPage.ts
async loginSuccess(email: string, password: string): Promise<void> {
  await this.login(email, password);
  await this.expectVisible(this.dashboardTitle, 'Dashboard page is NOT displayed after login');
}
```

```ts
// tests/user/login/login.spec.ts
await loginPage.loginSuccess(Env.CUSTOMER_EMAIL, Env.CUSTOMER_PASSWORD);
```

Benefits: when a locator changes, you fix **one file**, not every test.

### Fixtures

Fixtures give every test its page objects out of the box - a Manual Tester
never writes `new LoginPage(page)`:

```ts
test('...', async ({ loginPage, productPage, cartPage, log }) => { ... });
```

Three fixture files:
- `base.fixture.ts` - all page objects + the per-test `log` logger
- `authenticated-user.fixture.ts` - adds `userSession` (verifies the saved
  customer session is valid)
- `admin.fixture.ts` - adds `adminSession`

### storageState (saved sessions)

Instead of logging in in every test, the setup projects log in **once** and
save the session cookies to `storage/`:

```
setup/user-auth.setup.ts  →  storage/user-state.json
setup/admin-auth.setup.ts →  storage/admin-state.json
```

Tests that need a session just load it via the project configuration. Login
tests deliberately **do not** use storageState because they must perform a real
login.

### Test data

Credentials, product references and checkout data live in `data/*.json`, not in
the test code. Tests read them through `JsonHelper`:

```ts
const cartData = JsonHelper.readData<{ productA: { slug: string; name: string }; ... }>('cart/cart-data.json');
```

### Locators & assertions

Locators are **stable, business-meaningful** selectors (`#email`,
`button.add-to-cart`, `h1:has-text("Thank You for Your Order!")`). Assertions
use Playwright's built-in `expect` with auto-waiting, so tests do not need
random `sleep()` calls.

### Cross-browser & parallel

`playwright.config.ts` defines Chromium, Firefox and WebKit projects with
`fullyParallel: true`. Workers come from `WORKERS` (1 on CI). Stateful test
files opt into `serial` mode so they never collide on the shared account.

---

## Evidence when a test fails

Every failed test automatically produces:

| Artifact | Where | Purpose |
| --- | --- | --- |
| Screenshot | `test-results/<test>/test-failed-1.png` | see the exact screen state |
| Video | `test-results/<test>/video.webm` | replay what happened |
| Trace | `test-results/<test>/trace.zip` | inspect every action, network call and console message |
| HTML report | `playwright-report/index.html` | browse all results, open with `npm run report` |
| Log file | `logs/<date>/<test-title>.log` | step-by-step text log of the test |

Business steps are wrapped in `test.step(...)` so the report shows *where* the
flow broke in business terms:

```ts
await test.step('Step 5 - Confirmation: capture and verify the order code', async () => { ... });
```

---

## AI support in this project

AI support is limited to five clear functions. In every case the **Manual
Tester reviews the output and stays responsible for the result**.

### 1. Explain

Pick a framework concept - Page Object, Fixture, storageState, Locator,
Assertion, Report - and the AI explains it in simple language, linked to the
actual files in this project.

*Ask: "Explain what storageState does and why login tests don't use it."*

### 2. Guide

Follow a task step by step:

| Task | Outcome |
| --- | --- |
| Run login tests | `npm run test:login` |
| Read the HTML report | `npm run report` |
| Update ProfilePage | edit `pages/user/ProfilePage.ts`, run `npm run test:profile` |
| Add a new assertion | add `expect(...)` inside the test, run the module |
| Debug a failed checkout test | read the log + trace, fix, re-run |

### 3. Generate

Ask the AI to generate code **within the framework scope**: a page-object
method, a locator, sample test data, a test skeleton, an assertion, a utility
function. Always review and run the generated code before trusting it.

### 4. Review

Ask the AI to check the framework for:
- hardcoded credentials / URLs / data
- tests not using the Page Object Model
- unstable locators
- unclear or missing assertions
- duplicated logic

### 5. Debug

When a test fails, give the AI the **error message, screenshot, trace
description and the failed step**. The AI explains the likely cause and
suggests what to check. You still re-run the test and confirm the fix.

---

## Suggested demo flow

1. Run the three login cases (`npm run test:login`)
2. Run Manage Profile update (`npm run test:profile`)
3. Capture a product's information and save it to JSON + Excel (`npm run test:product`)
4. Add two products to the cart (`npm run test:cart`)
5. Run the full five-step checkout (`npm run test:checkout`)
6. Show the captured order code (visible in the HTML report / log)
7. Open the Admin page and compare one product (`npm run test:admin`)
8. Open the Playwright HTML Report (`npm run report`)
9. Show the screenshot / video / trace of a failed sample test
10. Ask the AI to explain the failure and suggest a fix

---

## Troubleshooting

### "Invalid login credentials" on every login

The Anh Tester demo site **resets its data periodically**. When that happens
the documented accounts stop working until the site owner restores them (or
until the next reset). Actions:

1. Verify the credentials manually in a browser.
2. If the account no longer exists, register a new one on
   `https://cms.anhtester.com/users/registration` and put it in `.env`.
3. Re-run the setup: `npx playwright test --project=setup-user --project=setup-admin`.

> **Known limitation:** the demo site can reject login attempts coming from
> datacenter / cloud IPs while the same credentials work from a residential
> connection. If login works in your browser but the framework reports
> *"Invalid login credentials"*, run the suite from your own machine instead.

### The framework logs in but "Add to cart" does nothing

Products **without** variants redirect straight to `/cart` after adding
(instead of opening a confirmation modal). The framework handles both cases
(`ProductPage.addToCart` races the modal against the `/cart` redirect).

### Tests are skipped after a setup failure

The `chromium` / `firefox` / `webkit` / `admin` projects depend on the setup
projects. If login fails, the session files are not created and dependent tests
are skipped. Fix the credentials first, then re-run.

### CSRF token mismatch (HTTP 419) when adding to cart

The demo site occasionally returns 419 on POST requests (load-balancer /
session issues on the shared demo). Retry the test - the issue is on the site
side, not in the framework.

### Browser executable not found

Ensure the Playwright browser version matches the framework:

```bash
npx playwright install
```

### Where do the captured product files go?

- JSON: `output/products/product-details.json`
- Excel: `output/products/product-details.xlsx`

Cross-browser runs add a project suffix (`product-details-firefox.json`) so
parallel browsers do not overwrite each other's files.