import fs from 'fs';
import path from 'path';

/**
 * JSON read / write helpers.
 *
 * Used to keep test data separated from test code and to save
 * product information captured from the website.
 */
export class JsonHelper {
  /**
   * Reads a JSON file from the data/ directory (path relative to data/).
   */
  static readData<T>(relativePath: string): T {
    const fullPath = path.resolve(process.cwd(), 'data', relativePath);
    return JsonHelper.read<T>(fullPath);
  }

  /**
   * Reads any JSON file from an absolute or workspace-relative path.
   */
  static read<T>(filePath: string): T {
    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON file not found: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new Error(`Cannot parse JSON file ${filePath}: ${String(error)}`);
    }
  }

  /**
   * Writes data to a JSON file (pretty-printed). Creates folders as needed.
   */
  static write(filePath: string, data: unknown): void {
    const fullPath = path.resolve(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}