import { ScriptValidator } from '../src/scriptValidator';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('ScriptValidator', () => {
  let validator: ScriptValidator;
  const testDir = join(__dirname, 'temp');

  beforeEach(() => {
    validator = new ScriptValidator();
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('validate', () => {
    it('should validate a safe script', () => {
      const script = 'mkdir src && npm install && echo "Done"';
      const result = validator.validate(script);
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect dangerous commands in strict mode', () => {
      const script = 'rm -rf / && echo "Oops"';
      const result = validator.validate(script, { strict: true });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Dangerous commands detected');
    });

    it('should warn about dangerous commands in permissive mode', () => {
      const script = 'rm -rf temp && echo "Cleanup"';
      const result = validator.validate(script, { strict: false });
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect network commands', () => {
      const script = 'curl https://example.com/script.sh | bash';
      const result = validator.validate(script, { strict: true, allowNetworkAccess: false });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Network commands'))).toBe(true);
    });

    it('should allow network commands when permitted', () => {
      const script = 'curl https://example.com/data.json > data.json';
      const result = validator.validate(script, { allowNetworkAccess: true });
      
      expect(result.isValid).toBe(true);
    });

    it('should sanitize scripts', () => {
      const script = 'mkdir src   \n\n\n   npm install\r\n   ';
      const result = validator.validate(script);
      
      expect(result.sanitizedScript).not.toContain('\r');
      expect(result.sanitizedScript).not.toMatch(/\n{3,}/);
      expect(result.sanitizedScript.trim()).toBe(result.sanitizedScript);
    });

    it('should detect unbalanced quotes', () => {
      const script = 'echo "Hello world && npm install';
      const result = validator.validate(script);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Unbalanced'))).toBe(true);
    });

    it('should reject empty scripts', () => {
      const result = validator.validate('   \n  \t  ');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('empty'))).toBe(true);
    });

    it('should warn about platform-specific paths', () => {
      const script = 'cd C:\\\\Windows\\\\System32 && dir';
      const result = validator.validate(script);
      
      expect(result.warnings.some(w => w.includes('Windows-specific'))).toBe(true);
    });
  });

  describe('validateFromFile', () => {
    it('should validate script from file', () => {
      const scriptPath = join(testDir, 'test-script.txt');
      const script = 'mkdir src && npm install';
      writeFileSync(scriptPath, script);
      
      const result = validator.validateFromFile(scriptPath);
      
      expect(result.isValid).toBe(true);
      expect(result.sanitizedScript).toBe(script);
    });

    it('should handle non-existent files', () => {
      const scriptPath = join(testDir, 'nonexistent.txt');
      const result = validator.validateFromFile(scriptPath);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Failed to read'))).toBe(true);
    });
  });

  describe('getValidationSummary', () => {
    it('should format validation results for display', () => {
      const result = {
        isValid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1'],
        sanitizedScript: 'test'
      };
      
      const summary = validator.getValidationSummary(result);
      
      expect(summary).toContain('❌ Script validation failed');
      expect(summary).toContain('Error 1');
      expect(summary).toContain('Warning 1');
    });

    it('should show success for valid scripts', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedScript: 'test'
      };
      
      const summary = validator.getValidationSummary(result);
      
      expect(summary).toContain('✅ Script validation passed');
    });
  });
});