import { join } from 'path';
import { copyFileSync, existsSync } from 'fs';

/**
 * Test fixture utilities
 */
export class TestFixtures {
  private static FIXTURES_DIR = join(__dirname, 'files');
  
  static getFixturePath(category: 'valid' | 'invalid' | 'binary', filename: string): string {
    return join(this.FIXTURES_DIR, category, filename);
  }
  
  static copyFixtureToTemp(category: 'valid' | 'invalid' | 'binary', filename: string, tempDir: string): string {
    const sourcePath = this.getFixturePath(category, filename);
    const destPath = join(tempDir, filename);
    
    if (!existsSync(sourcePath)) {
      throw new Error(`Fixture file not found: ${sourcePath}`);
    }
    
    copyFileSync(sourcePath, destPath);
    return destPath;
  }
  
  static getValidScriptPaths(): Record<string, string> {
    return {
      shell: this.getFixturePath('valid', 'test.sh'),
      python: this.getFixturePath('valid', 'test.py'),
      javascript: this.getFixturePath('valid', 'test.js'),
      powershell: this.getFixturePath('valid', 'test.ps1'),
      batch: this.getFixturePath('valid', 'test.bat'),
      large: this.getFixturePath('valid', 'large-script.sh')
    };
  }
  
  static getInvalidScriptPaths(): Record<string, string> {
    return {
      empty: this.getFixturePath('invalid', 'empty.sh'),
      unusualExt: this.getFixturePath('invalid', 'unusual-extension.xyz')
    };
  }
  
  static getBinaryFilePaths(): Record<string, string> {
    return {
      binaryContent: this.getFixturePath('binary', 'binary-content.txt'),
      fakeExe: this.getFixturePath('binary', 'fake.exe'),
      fakePng: this.getFixturePath('binary', 'fake.png')
    };
  }
}