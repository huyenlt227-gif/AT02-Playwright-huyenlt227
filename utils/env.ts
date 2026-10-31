import 'dotenv/config';

/**
 * Typed access to environment variables.
 *
 * Every credential / URL lives in .env - never hardcode them in tests.
 */
export class Env {
  static get USER_BASE_URL(): string {
    return process.env.USER_BASE_URL ?? 'https://cms.anhtester.com';
  }

  static get ADMIN_BASE_URL(): string {
    return process.env.ADMIN_BASE_URL ?? 'https://cms.anhtester.com/login';
  }

  static get CUSTOMER_EMAIL(): string {
    return process.env.CUSTOMER_EMAIL ?? '';
  }

  static get CUSTOMER_PASSWORD(): string {
    return process.env.CUSTOMER_PASSWORD ?? '';
  }

  static get ADMIN_EMAIL(): string {
    return process.env.ADMIN_EMAIL ?? '';
  }

  static get ADMIN_PASSWORD(): string {
    return process.env.ADMIN_PASSWORD ?? '';
  }

  static get DEFAULT_TIMEOUT(): number {
    return Number(process.env.DEFAULT_TIMEOUT ?? 30_000);
  }

  static get WORKERS(): number {
    return Number(process.env.WORKERS ?? 2);
  }
}