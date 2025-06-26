# Test Fixtures

This directory contains test fixture files used by the test suite to avoid creating files on-the-fly.

## Directory Structure

### `valid/`
Contains valid script files that should pass validation:
- `test.sh` - Basic shell script
- `test.py` - Python script with shebang
- `test.js` - JavaScript/Node.js script
- `test.ps1` - PowerShell script
- `test.bat` - Windows batch script
- `large-script.sh` - Large shell script for testing file size handling

### `invalid/`
Contains files that should fail validation or produce warnings:
- `empty.sh` - Empty file (should fail validation)
- `unusual-extension.xyz` - Script with unusual file extension (should warn)

### `binary/`
Contains files that should be rejected as binary:
- `binary-content.txt` - File with actual binary content (null bytes)
- `fake.exe` - Text file with binary extension
- `fake.png` - Text file with image extension

## Usage

Use the `TestFixtures` utility class from `test-utils.ts` to access these files:

```typescript
import { TestFixtures } from './test-utils';

// Copy a fixture to the test temp directory
const scriptPath = TestFixtures.copyFixtureToTemp('valid', 'test.sh', TEST_DIR);

// Get direct path to fixture (read-only)
const fixturePath = TestFixtures.getFixturePath('invalid', 'empty.sh');
```

## Benefits

1. **Cleaner tests** - No inline file creation cluttering test logic
2. **Reusable** - Same fixtures can be used across multiple tests
3. **Maintainable** - Easy to update test files in one place
4. **Realistic** - Proper file examples with real content
5. **Version controlled** - Test files are checked into git for consistency

## Note on Test Structure

The current test suite uses simplified smoke tests to verify core functionality and alias configuration. The comprehensive file fixtures in this directory are ready for expanded testing when needed. The basic tests verify:

- Core CLI commands work without crashing
- New alias configuration (`scripts`) is properly set up, with `sc` removed to avoid Windows conflicts
- File type validation rejects binary extensions
- All supported file types are documented and available as fixtures