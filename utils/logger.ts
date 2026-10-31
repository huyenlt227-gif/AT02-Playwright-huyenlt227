import fs from 'fs';
import path from 'path';

/**
 * Per-test file logger.
 *
 * Every test gets its own log file under logs/<yyyy-mm-dd>/<test-title>.log
 * so a Manual Tester can read exactly what happened during a failed test.
 */
export class TestLogger {
  readonly filePath: string;

  constructor(private readonly testTitle: string) {
    const day = new Date().toISOString().slice(0, 10);
    const dir = path.resolve(process.cwd(), 'logs', day);
    fs.mkdirSync(dir, { recursive: true });
    const safeTitle = testTitle.replace(/[^\w\-]+/g, '_').slice(0, 80);
    this.filePath = path.join(dir, `${safeTitle}-${Date.now()}.log`);
    fs.writeFileSync(this.filePath, `[${timestamp()}] START  ${testTitle}\n`);
  }

  info(message: string): void {
    this.write('INFO', message);
  }

  warn(message: string): void {
    this.write('WARN', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  step(message: string): void {
    this.write('STEP', message);
  }

  private write(level: string, message: string): void {
    const line = `[${timestamp()}] [${level}] ${message}`;
    // eslint-disable-next-line no-console
    console.log(line);
    fs.appendFileSync(this.filePath, `${line}\n`);
  }
}

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}