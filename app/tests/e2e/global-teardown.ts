/**
 * E2E Global Teardown
 * 
 * Cleans up the E2E test environment.
 * Removes temporary files, closes databases, and restores system state.
 */

import * as fs from 'fs';

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Cleaning up E2E test environment...');
  
  // Get temporary directory from environment
  const tempDir = process.env.E2E_TEMP_DIR;
  
  if (tempDir && fs.existsSync(tempDir)) {
    try {
      // Remove temporary directory and all contents
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log(`✅ Cleaned up temporary directory: ${tempDir}`);
    } catch (error) {
      console.warn(`⚠️  Failed to clean up temporary directory: ${error}`);
    }
  }
  
  // Clean up environment variables
  delete process.env.E2E_TEMP_DIR;
  delete process.env.E2E_TEST_DB;
  delete process.env.E2E_CONFIG_DIR;
  delete process.env.E2E_TEST_SCRIPTS_DIR;
  
  console.log('✅ E2E teardown complete');
}