#!/usr/bin/env node

/**
 * Scaffold Scripts CLI - Application Entry Point
 * 
 * Minimal entry point that bootstraps the application.
 * Reduced from 1166 lines in legacy to <20 lines.
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 3 for implementation
 */

import { Application } from './Application.js'

async function main(): Promise<void> {
  try {
    const app = new Application()
    await app.run(process.argv)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Fatal error:', message)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
