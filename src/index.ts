#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { join } from 'path'
import prompts from 'prompts'
import { ScaffoldDatabase, ScaffoldCommand } from './database.js'
import { ScriptExecutor } from './scriptExecutor.js'
import { ScriptValidator } from './scriptValidator.js'
import { ScriptProcessor } from './scriptProcessor.js'
import { SystemCapabilityChecker } from './systemCapabilities.js'
import { sym } from './symbols.js'
import { UsageHelper } from './usageHelper.js'

// Get version from package.json
const packageJsonPath = join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

const program = new Command()
// Lazy-load expensive components only when needed
let db: ScaffoldDatabase | null = null;
function getDatabase() {
  if (!db) {
    db = new ScaffoldDatabase();
  }
  return db;
}

const executor = new ScriptExecutor()
const validator = new ScriptValidator()
const processor = new ScriptProcessor()

function getSystemChecker() {
  return SystemCapabilityChecker.getInstance();
}

program
  .name('scaffold')
  .description('CLI tool for managing and executing scaffold scripts')
  .version(packageJson.version, '-v, --version', 'display version number')
  .helpOption('-h, --help', 'display help for command')
  .addHelpCommand('help [command]', 'display help for command')

// Configure custom help
program.configureHelp({
  helpWidth: 80,
  sortSubcommands: true
});

// Custom help display
program.on('--help', () => {
  UsageHelper.displayMainHelp();
});

// Configure Commander to use our error handling
program.exitOverride();

// Override Commander's error output
program.configureOutput({
  writeErr: () => {}, // Suppress all Commander error output
  writeOut: (str) => process.stdout.write(str)
});

// Main scaffolding commands
program
  .argument('[script-name]', 'run script with specified name')
  .option('--original', 'run the original script version')
  .option('--converted', 'run the converted script version')
  .option('--windows', 'run the Windows-specific script version')
  .option('--unix', 'run the Unix-specific script version')
  .option('--cross-platform', 'run the cross-platform script version')
  .action(async (scriptName, options) => {
  try {
    if (scriptName) {
      await handleScriptCommand(scriptName, false, options)
    } else {
      // Check if we're in a test environment - don't enter interactive mode
      if (process.env.NODE_ENV === 'test' || process.env.CI || !process.stdin.isTTY) {
        await listCommands(false)
        return
      }
      
      // Interactive mode when no script name provided
      const selectedScript = await selectScriptInteractively()

      if (!selectedScript) {
        return // User cancelled or no scripts available
      }

      // Handle special actions
      if (selectedScript === 'list') {
        await listCommands(false)
        return
      }

      if (selectedScript === 'add') {
        UsageHelper.displayCommandHelp('add');
        return
      }

      if (selectedScript === 'clear') {
        await clearAllCommands()
        return
      }

      if (selectedScript === 'exit') {
        console.log(chalk.blue(`Goodbye! ${sym.party()}`))
        return
      }

      // Run the selected script
      await handleScriptCommand(selectedScript, false)
    }
  } catch (error: any) {
    UsageHelper.displayError(error.message, 'Check your command syntax and try again');
    process.exit(1)
  }
})

// Add command
program
  .command('add')
  .alias('a')
  .description('add a new script')
  .argument('<name>', 'script name')
  .argument('<scriptPath>', 'path to script file')
  .option('-p, --platform <platform>', 'target platform: all, windows, or unix', 'all')
  .option('-c, --convert', 'force conversion to multiple script types')
  .option('--strict', 'use strict validation')
  .option('--no-validate', 'skip validation (use with caution)')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('add');
  })
  .action(async (name, scriptPath, options) => {
    try {
      await addCommand(name, scriptPath, options)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Check your script path and try again');
      process.exit(1)
    }
  })

// Update command
program
  .command('update')
  .alias('u')
  .description('update an existing script')
  .argument('<name>', 'script name')
  .argument('<scriptPath>', 'path to new script file')
  .option('-p, --platform <platform>', 'update target platform')
  .option('--strict', 'use strict validation')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('update');
  })
  .action(async (name, scriptPath, options) => {
    try {
      await updateCommand(name, scriptPath, options)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Check that the script exists and path is correct');
      process.exit(1)
    }
  })

// Remove command
program
  .command('remove')
  .alias('r')
  .description('remove a script')
  .argument('<name>', 'script name')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('remove');
  })
  .action(async (name) => {
    try {
      await removeCommand(name)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Check that the script name is correct');
      process.exit(1)
    }
  })

// Clear all command
program
  .command('clear')
  .description('clear all scripts from database')
  .option('-y, --yes', 'skip confirmation prompt')
  .on('--help', () => {
    console.log('')
    console.log('Examples:')
    console.log('  $ scripts clear        # Clear all scripts with confirmation')
    console.log('  $ scripts clear -y     # Clear all scripts without confirmation')
  })
  .action(async (options) => {
    try {
      if (options.yes) {
        // Skip confirmation and clear directly
        const deletedCount = await getDatabase().clearAllCommands()
        if (deletedCount > 0) {
          console.log(chalk.green(`${sym.check()} Successfully cleared ${deletedCount} script(s) from the database.`))
        } else {
          console.log(chalk.blue(`${sym.info()} No scripts were found to clear.`))
        }
      } else {
        await clearAllCommands()
      }
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Unable to clear scripts');
      process.exit(1)
    }
  })

// List commands
program
  .command('list')
  .alias('l')
  .description('list available scripts')
  .option('-d, --detailed', 'show detailed information')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('list');
  })
  .action(async (options) => {
    try {
      await listCommands(options.detailed)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Unable to retrieve script list');
      process.exit(1)
    }
  })

// View command
program
  .command('view')
  .alias('s')
  .description('view script details')
  .argument('<name>', 'script name')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('view');
  })
  .action(async (name) => {
    try {
      await handleScriptCommand(name, true)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Check that the script name is correct');
      process.exit(1)
    }
  })

// Export command
program
  .command('export')
  .description('export all scripts to a directory')
  .argument('<directory>', 'directory to export scripts to')
  .on('--help', () => {
    UsageHelper.displayCommandHelp('export');
  })
  .action(async (directory) => {
    try {
      await exportCommand(directory)
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Check that the directory path is valid and writable');
      process.exit(1)
    }
  })

// Uninstall command
program
  .command('uninstall')
  .description('uninstall scaffold-scripts CLI')
  .action(async () => {
    try {
      await uninstallCommand()
    } catch (error: any) {
      UsageHelper.displayError(error.message, 'Try manual uninstallation or check the documentation');
      process.exit(1)
    }
  })

// Interactive script selector
async function selectScriptInteractively(): Promise<string | null> {
  // Never allow interactive mode in test environments
  if (process.env.NODE_ENV === 'test' || process.env.CI || !process.stdin.isTTY) {
    console.log('No scripts available.')
    return null
  }

  const commands = await getDatabase().listCommands()

  if (commands.length === 0) {
    console.log(chalk.yellow('No scripts available.'))
    console.log(chalk.blue('Add one with: scripts add <name> <script-path>'))
    return null
  }

  console.log(chalk.blue(`\n${sym.rocket()} Available Scripts:`))

  const choices = commands.map((cmd) => {
    const alias = cmd.alias ? ` (${cmd.alias})` : ''
    const platform = cmd.platform !== 'all' ? ` [${cmd.platform}]` : ''
    const description = cmd.description ? ` - ${cmd.description}` : ''

    return {
      title: `${cmd.name}${alias}${platform}${description}`,
      value: cmd.name,
      description: cmd.description || 'No description',
    }
  })

  // Add management options
  choices.push(
    { title: '─'.repeat(50), value: 'separator', description: '─' },
    {
      title: `${sym.list()} List all scripts`,
      value: 'list',
      description: 'Show all available scripts',
    },
    {
      title: `${sym.package()} Add new script`,
      value: 'add',
      description: 'Get help adding a new script',
    },
    {
      title: `${sym.warning()} Clear all scripts`,
      value: 'clear',
      description: 'Remove all scripts from the database',
    },
    { title: `${sym.cross()} Exit`, value: 'exit', description: 'Exit interactive mode' },
  )

  try {
    const response = await prompts({
      type: 'select',
      name: 'script',
      message: 'Select a script to run:',
      choices: choices,
      initial: 0,
    })

    return response.script || null
  } catch (error) {
    // Handle Ctrl+C or other interruption
    console.log(chalk.yellow('\nOperation cancelled.'))
    return null
  }
}

// Clear all commands
async function clearAllCommands() {
  // Skip confirmation in test environments
  if (process.env.NODE_ENV === 'test' || process.env.CI || !process.stdin.isTTY) {
    const deletedCount = await getDatabase().clearAllCommands()
    if (deletedCount > 0) {
      console.log(chalk.green(`${sym.check()} Successfully cleared ${deletedCount} script(s) from the database.`))
    } else {
      console.log(chalk.blue(`${sym.info()} No scripts were found to clear.`))
    }
    return
  }

  console.log(chalk.yellow(`${sym.warning()} This will permanently delete ALL scripts from your database.`))
  
  const confirmation = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Are you sure you want to clear all scripts?',
    initial: false
  })

  if (!confirmation.proceed) {
    console.log(chalk.blue('Operation cancelled.'))
    return
  }

  try {
    const deletedCount = await getDatabase().clearAllCommands()
    if (deletedCount > 0) {
      console.log(chalk.green(`${sym.check()} Successfully cleared ${deletedCount} script(s) from the database.`))
    } else {
      console.log(chalk.blue(`${sym.info()} No scripts were found to clear.`))
    }
  } catch (error: any) {
    console.error(chalk.red(`${sym.cross()} Error clearing scripts: ${error.message}`))
  }
}

// Handle script commands
async function handleScriptCommand(scriptName: string, viewOnly: boolean = false, versionOptions?: any) {
  // Try to find by name first, then by alias
  let command = await getDatabase().getCommand(scriptName)
  if (!command) {
    command = await getDatabase().getCommandByAlias(scriptName)
  }

  if (!command) {
    const commands = await getDatabase().listCommands()
    const scriptNames = commands.map(cmd => cmd.name)
    UsageHelper.displayScriptNotFound(scriptName, scriptNames);
    return
  }

  if (viewOnly) {
    displayCommandDetails(command)
  } else {
    console.log(chalk.blue(`Executing script: ${command.name}`))
    if (command.description) {
      console.log(chalk.gray(command.description))
    }

    // Determine which script version to execute based on flags
    let scriptToExecute = command.script_original; // default to original
    let versionUsed = 'original';

    if (versionOptions) {
      if (versionOptions.original) {
        scriptToExecute = command.script_original;
        versionUsed = 'original';
      } else if (versionOptions.converted) {
        scriptToExecute = processor.getBestScript(command);
        versionUsed = 'converted';
      } else if (versionOptions.windows && command.script_windows) {
        scriptToExecute = command.script_windows;
        versionUsed = 'Windows';
      } else if (versionOptions.unix && command.script_unix) {
        scriptToExecute = command.script_unix;
        versionUsed = 'Unix';
      } else if (versionOptions.crossPlatform && command.script_cross_platform) {
        scriptToExecute = command.script_cross_platform;
        versionUsed = 'cross-platform';
      } else if (versionOptions.windows && !command.script_windows) {
        console.log(chalk.yellow(`${sym.warning()} Windows version not available, using original`));
        scriptToExecute = command.script_original;
        versionUsed = 'original (Windows not available)';
      } else if (versionOptions.unix && !command.script_unix) {
        console.log(chalk.yellow(`${sym.warning()} Unix version not available, using original`));
        scriptToExecute = command.script_original;
        versionUsed = 'original (Unix not available)';
      } else if (versionOptions.crossPlatform && !command.script_cross_platform) {
        console.log(chalk.yellow(`${sym.warning()} Cross-platform version not available, using original`));
        scriptToExecute = command.script_original;
        versionUsed = 'original (cross-platform not available)';
      }
    } else {
      // Default behavior - auto-select best version based on system capabilities
      const systemChecker = getSystemChecker();
      const canExecuteOriginal = await systemChecker.canExecuteScriptType(command.script_type);
      const bestExecutor = await systemChecker.getBestExecutor(command.script_type);
      
      if (canExecuteOriginal && bestExecutor) {
        // We can execute the original script type natively
        scriptToExecute = command.script_original;
        versionUsed = `original (${bestExecutor})`;
      } else {
        // Try to find a converted version we can execute
        const systemChecker = getSystemChecker();
        const capabilities = await systemChecker.getCapabilities();
        let foundExecutableVersion = false;
        
        // Check Windows version if we have PowerShell
        if (command.script_windows && capabilities.canRunPowerShell) {
          scriptToExecute = command.script_windows;
          versionUsed = 'Windows (PowerShell)';
          foundExecutableVersion = true;
        }
        // Check Unix version if we have shell
        else if (command.script_unix && capabilities.canRunShell) {
          scriptToExecute = command.script_unix;
          versionUsed = 'Unix (shell)';
          foundExecutableVersion = true;
        }
        // Check cross-platform version
        else if (command.script_cross_platform) {
          scriptToExecute = command.script_cross_platform;
          versionUsed = 'cross-platform';
          foundExecutableVersion = true;
        }
        
        if (!foundExecutableVersion) {
          // Fall back to original and hope for the best
          scriptToExecute = command.script_original;
          versionUsed = 'original (no suitable executor found)';
          console.log(chalk.yellow(`${sym.warning()} No suitable executor found for ${command.script_type} scripts`));
          
          const systemChecker = getSystemChecker();
          const platformInfo = await systemChecker.getPlatformInfo();
          if (platformInfo.recommendations.length > 0) {
            console.log(chalk.blue(`${sym.bulb()} To improve compatibility:`));
            platformInfo.recommendations.forEach(rec => {
              console.log(chalk.blue(`   • ${rec}`));
            });
          }
        }
      }
    }

    console.log(chalk.gray(`Using ${versionUsed} version`));
    
    // Determine the appropriate script type based on version being executed
    let effectiveScriptType = command.script_type;
    if (versionOptions?.windows && command.script_windows) {
      // Only change to PowerShell if original was shell/bash (converted version)
      if (command.script_type === 'shell') {
        effectiveScriptType = 'powershell'; // Windows version should run as PowerShell
      }
    }
    // Unix versions and other types keep their original script type
    // Python stays Python, JavaScript stays JavaScript, etc.
    
    const result = await executor.executeScript(scriptToExecute, command.platform, [], effectiveScriptType)
    console.log(chalk.green(`\n${sym.check()} Script completed successfully!`))
    
    // Output is now streamed in real-time, so we don't need to display it again
    // Only show stderr if there were any non-fatal errors
    if (result.stderr && result.stderr.trim()) {
      console.log(chalk.yellow('\n--- Warnings/Errors ---'))
      console.log(result.stderr)
    }
  }
}

// Add new command - Production Ready Version
async function addCommand(name: string, scriptPath: string, options: any) {
  try {
    console.log(chalk.blue(`${sym.package()} Processing script: ${name}`))

    // Check system capabilities first
    console.log(chalk.blue(`\n${sym.search()} Checking System Capabilities...`))
    const checker = getSystemChecker();
    const capabilities = await checker.getCapabilities()
    const platformInfo = await checker.getPlatformInfo()
    
    console.log(chalk.gray(`   Platform: ${platformInfo.platform}`))
    console.log(chalk.gray(`   Shell Support: ${capabilities.canRunShell ? `${sym.check()} Available` : `${sym.cross()} Not available`}`))
    console.log(chalk.gray(`   PowerShell Support: ${capabilities.canRunPowerShell ? `${sym.check()} Available` : `${sym.cross()} Not available`}`))
    console.log(chalk.gray(`   Python Support: ${capabilities.canRunPython ? `${sym.check()} Available` : `${sym.cross()} Not available`}`))
    console.log(chalk.gray(`   Node.js Support: ${capabilities.canRunJavaScript ? `${sym.check()} Available` : `${sym.cross()} Not available`}`))

    // Determine script type from file extension
    const scriptType = processor.getScriptTypeFromPath(scriptPath)
    console.log(chalk.blue(`\n${sym.file()} Script Type: ${scriptType}`))

    // Check if we can execute this script type
    const checker2 = getSystemChecker();
    const canExecuteNatively = await checker2.canExecuteScriptType(scriptType)
    const shouldConvert = options.convert || !canExecuteNatively

    if (options.convert) {
      console.log(chalk.yellow(`${sym.warning()} Force conversion enabled via --convert flag`))
    } else if (!canExecuteNatively) {
      console.log(chalk.yellow(`${sym.warning()} Cannot execute ${scriptType} scripts natively - conversion recommended`))
      const executor = await checker2.getBestExecutor(scriptType)
      if (!executor) {
        console.log(chalk.red(`${sym.cross()} No suitable executor found for ${scriptType} scripts`))
        if (platformInfo.recommendations.length > 0) {
          console.log(chalk.blue(`\n${sym.bulb()} Recommendations:`))
          platformInfo.recommendations.forEach(rec => {
            console.log(chalk.blue(`   • ${rec}`))
          })
        }
      }
    } else {
      console.log(chalk.green(`${sym.check()} Can execute ${scriptType} scripts natively`))
    }

    // Process the script using the production-ready processor
    const processedScript = await processor.processScriptFile(scriptPath, {
      strict: options.strict || false,
      allowNetworkAccess: !options.strict,
      allowSystemModification: !options.strict,
      shouldConvert: shouldConvert,
    })

    // Display validation results
    console.log(`\n${sym.list()} Validation Results:`)
    if (processedScript.validation.isValid) {
      console.log(chalk.green(`${sym.check()} Script validation passed`))
    } else {
      console.log(chalk.red(`${sym.cross()} Script validation failed`))
    }

    if (processedScript.validation.errors.length > 0) {
      console.log(chalk.red('\nErrors:'))
      processedScript.validation.errors.forEach((error) => {
        console.log(chalk.red(`  • ${error}`))
      })
    }

    if (processedScript.validation.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'))
      processedScript.validation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  • ${warning}`))
      })
    }

    // Fail if validation failed and not overridden
    if (!processedScript.validation.isValid && options.validate !== false) {
      console.error(chalk.red(`\n${sym.cross()} Cannot add command due to validation errors.`))
      console.log(chalk.gray('Use --no-validate to skip validation (not recommended).'))
      return
    }

    // Display script processing info
    console.log(chalk.blue(`\n${sym.search()} Script Analysis:`))
    console.log(chalk.gray(`   Original Platform: ${processedScript.originalPlatform}`))
    console.log(chalk.gray(`   Script Type: ${processedScript.scriptType}`))
    console.log(
      chalk.gray(
        `   Windows Version: ${processedScript.windows ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`,
      ),
    )
    console.log(
      chalk.gray(`   Unix Version: ${processedScript.unix ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`),
    )
    console.log(
      chalk.gray(
        `   Cross-Platform: ${processedScript.crossPlatform ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`,
      ),
    )

    // Create the command object
    const command = processor.createCommand(name, processedScript, {
      platform: options.platform,
    })

    // Save to database
    await getDatabase().addCommand(command)

    console.log(chalk.green(`${sym.check()} Added script "${name}"`))

    // Show usage examples
    console.log(chalk.blue(`${sym.rocket()} Usage Examples:`))
    console.log(chalk.cyan(`   scripts ${name}                    # Run the script`))
    console.log(chalk.cyan(`   scripts ${name} arg1 arg2         # Run with arguments`))
    console.log(chalk.cyan(`   scripts view ${name}              # View script details`))
    console.log(chalk.cyan(`   scripts remove ${name}            # Remove this script`))
    console.log(chalk.cyan(`   scripts list                      # List all scripts`))

    // Show platform compatibility info
    const compatibility = processor.validatePlatformCompatibility(command as any, process.platform)
    if (!compatibility.compatible || compatibility.warnings.length > 0) {
      console.log(chalk.yellow(`${sym.warning()} Platform Compatibility:`))
      compatibility.warnings.forEach((warning) => {
        console.log(chalk.yellow(`   • ${warning}`))
      })
      if (compatibility.recommendations.length > 0) {
        console.log(chalk.blue(`${sym.bulb()} Recommendations:`))
        compatibility.recommendations.forEach((rec) => {
          console.log(chalk.blue(`   • ${rec}`))
        })
      }
    }
  } catch (error: any) {
    console.error(chalk.red(`${sym.cross()} Failed to add command: ${error.message}`))
    throw error
  }
}

// Update existing command - Production Ready Version
async function updateCommand(name: string, scriptPath: string, options: any) {
  try {
    const existing = await getDatabase().getCommand(name)
    if (!existing) {
      console.error(chalk.red(`Script "${name}" not found.`))
      return
    }

    console.log(chalk.blue(`${sym.package()} Updating script: ${name}`))

    // Process the new script using the production-ready processor
    const processedScript = await processor.processScriptFile(scriptPath, {
      strict: options.strict || false,
      allowNetworkAccess: !options.strict,
      allowSystemModification: !options.strict,
    })

    // Display validation results
    console.log(`\n${sym.list()} Validation Results:`)
    if (processedScript.validation.isValid) {
      console.log(chalk.green(`${sym.check()} Script validation passed`))
    } else {
      console.log(chalk.red(`${sym.cross()} Script validation failed`))
    }

    if (processedScript.validation.errors.length > 0) {
      console.log(chalk.red('\nErrors:'))
      processedScript.validation.errors.forEach((error) => {
        console.log(chalk.red(`  • ${error}`))
      })
    }

    if (processedScript.validation.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'))
      processedScript.validation.warnings.forEach((warning) => {
        console.log(chalk.yellow(`  • ${warning}`))
      })
    }

    // Fail if validation failed and not overridden
    if (!processedScript.validation.isValid && options.validate !== false) {
      console.error(chalk.red(`\n${sym.cross()} Cannot update command due to validation errors.`))
      console.log(chalk.gray('Use --no-validate to skip validation (not recommended).'))
      return
    }

    // Display script processing info
    console.log(chalk.blue(`\n${sym.search()} Script Analysis:`))
    console.log(chalk.gray(`   Original Platform: ${processedScript.originalPlatform}`))
    console.log(chalk.gray(`   Script Type: ${processedScript.scriptType}`))
    console.log(
      chalk.gray(
        `   Windows Version: ${processedScript.windows ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`,
      ),
    )
    console.log(
      chalk.gray(`   Unix Version: ${processedScript.unix ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`),
    )
    console.log(
      chalk.gray(
        `   Cross-Platform: ${processedScript.crossPlatform ? `${sym.check()} Generated` : `${sym.cross()} Not available`}`,
      ),
    )

    // Prepare updates with new multi-script fields
    const updates: Partial<ScaffoldCommand> = {
      script_original: processedScript.original,
      script_windows: processedScript.windows,
      script_unix: processedScript.unix,
      script_cross_platform: processedScript.crossPlatform,
      original_platform: processedScript.originalPlatform,
      script_type: processedScript.scriptType as any,
    }

    if (options.platform !== undefined) updates.platform = options.platform

    const success = await getDatabase().updateCommand(name, updates)
    if (success) {
      console.log(chalk.green(`\n${sym.check()} Updated script "${name}"`))

      // Show usage examples
      console.log(chalk.blue(`\n${sym.rocket()} Usage Examples:`))
      console.log(chalk.cyan(`   scripts ${name}                    # Run the updated script`))
      console.log(chalk.cyan(`   scripts ${name} arg1 arg2         # Run with arguments`))
      console.log(chalk.cyan(`   scripts view ${name}              # View script details`))

      // Show platform compatibility info for updated command
      const updatedCommand = { ...existing, ...updates } as ScaffoldCommand
      const compatibility = processor.validatePlatformCompatibility(
        updatedCommand,
        process.platform,
      )
      if (!compatibility.compatible || compatibility.warnings.length > 0) {
        console.log(chalk.yellow(`\n${sym.warning()} Platform Compatibility:`))
        compatibility.warnings.forEach((warning) => {
          console.log(chalk.yellow(`   • ${warning}`))
        })
        if (compatibility.recommendations.length > 0) {
          console.log(chalk.blue(`\n${sym.bulb()} Recommendations:`))
          compatibility.recommendations.forEach((rec) => {
            console.log(chalk.blue(`   • ${rec}`))
          })
        }
      }
    } else {
      console.error(chalk.red(`${sym.cross()} Failed to update command.`))
    }
  } catch (error: any) {
    console.error(chalk.red(`${sym.cross()} Failed to update command: ${error.message}`))
    throw error
  }
}

// Remove command
async function removeCommand(name: string) {
  const success = await getDatabase().removeCommand(name)
  if (success) {
    console.log(chalk.green(`${sym.check()} Removed script "${name}"`))
  } else {
    console.error(chalk.red(`Script "${name}" not found.`))
  }
}

// List commands
async function listCommands(detailed: boolean = false) {
  const commands = await getDatabase().listCommands()

  if (commands.length === 0) {
    console.log(chalk.gray('No scripts available.'))
    return
  }

  console.log(chalk.blue(`\n${sym.list()} Available Scripts:`))

  commands.forEach((cmd) => {
    const alias = cmd.alias ? chalk.gray(` (${cmd.alias})`) : ''
    const platform = cmd.platform !== 'all' ? chalk.gray(` [${cmd.platform}]`) : ''

    if (detailed) {
      console.log(chalk.cyan(`  • ${cmd.name}${alias}${platform}`))
      if (cmd.description) {
        console.log(chalk.gray(`    ${cmd.description}`))
      }
      console.log(chalk.gray(`    Updated: ${new Date(cmd.updatedAt).toLocaleDateString()}`))
    } else {
      console.log(chalk.cyan(`  • ${cmd.name}${alias}${platform}`))
    }
  })
}

// Display command details - Production Ready Version
function displayCommandDetails(command: any) {
  console.log(chalk.blue(`\n${sym.page()} Command Details: ${command.name}`))
  console.log(chalk.gray('═'.repeat(60)))

  // Basic info
  console.log(chalk.yellow('Type:'), chalk.cyan(command.type))
  console.log(chalk.yellow('Name:'), chalk.cyan(command.name))
  if (command.alias) {
    console.log(chalk.yellow('Alias:'), chalk.cyan(command.alias))
  }
  if (command.description) {
    console.log(chalk.yellow('Description:'), command.description)
  }
  console.log(chalk.yellow('Platform Support:'), chalk.cyan(command.platform))
  console.log(chalk.yellow('Created:'), new Date(command.createdAt).toLocaleString())
  console.log(chalk.yellow('Updated:'), new Date(command.updatedAt).toLocaleString())

  // Script metadata
  if (command.script_type) {
    console.log('\n' + chalk.blue(`${sym.list()} Script Information:`))
    console.log(chalk.gray('─'.repeat(40)))
    console.log(chalk.yellow('Original Platform:'), chalk.cyan(command.original_platform))
    console.log(chalk.yellow('Script Type:'), chalk.cyan(command.script_type))
  }

  // Get version info using processor
  const versionInfo = processor.getScriptVersionInfo(command)

  console.log('\n' + chalk.blue(`${sym.page()} Script Versions:`))
  console.log(chalk.gray('─'.repeat(40)))

  // Original script
  console.log(
    chalk.yellow(
      `\n${sym.diamond()} Original (${versionInfo.original.platform}, ${versionInfo.original.type}):`,
    ),
  )
  console.log(
    chalk.gray(
      versionInfo.original.content.split('\n').slice(0, 5).join('\n') +
        (versionInfo.original.content.split('\n').length > 5 ? '\n...' : ''),
    ),
  )

  // Windows version
  if (versionInfo.windows?.available) {
    console.log(chalk.yellow(`\n${sym.diamond()} Windows Version:`))
    console.log(
      chalk.gray(versionInfo.windows.content.split('\n').slice(0, 3).join('\n') + '...'),
    )
  }

  // Unix version
  if (versionInfo.unix?.available) {
    console.log(chalk.yellow(`\n${sym.diamond()} Unix Version:`))
    console.log(chalk.gray(versionInfo.unix.content.split('\n').slice(0, 3).join('\n') + '...'))
  }

  // Cross-platform version
  if (versionInfo.crossPlatform?.available) {
    console.log(chalk.yellow(`\n${sym.diamond()} Cross-Platform Version:`))
    console.log(
      chalk.gray(versionInfo.crossPlatform.content.split('\n').slice(0, 3).join('\n') + '...'),
    )
  }

  // Best version for current platform
  console.log(
    '\n' + chalk.blue(`${sym.target()} Best for Current Platform (${versionInfo.bestForCurrent.version}):`),
  )
  console.log(chalk.gray('─'.repeat(40)))
  console.log(versionInfo.bestForCurrent.content)

  // Platform compatibility
  const compatibility = processor.validatePlatformCompatibility(command, process.platform)
  if (!compatibility.compatible || compatibility.warnings.length > 0) {
    console.log('\n' + chalk.yellow(`${sym.warning()} Platform Compatibility:`))
    console.log(chalk.gray('─'.repeat(40)))
    compatibility.warnings.forEach((warning) => {
      console.log(chalk.yellow(`• ${warning}`))
    })
    if (compatibility.recommendations.length > 0) {
      console.log('\n' + chalk.blue(`${sym.bulb()} Recommendations:`))
      compatibility.recommendations.forEach((rec) => {
        console.log(chalk.blue(`• ${rec}`))
      })
    }
  } else {
    console.log('\n' + chalk.green(`${sym.check()} Fully compatible with current platform`))
  }
}

// Export command
async function exportCommand(directory: string) {
  const fs = await import('fs')
  const path = await import('path')

  console.log(chalk.blue(`${sym.package()} Exporting scripts to: ${directory}`))

  // Create export directory
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }

  // Get all commands
  const commands = await getDatabase().listCommands()

  if (commands.length === 0) {
    console.log(chalk.yellow('No scripts to export'))
    return
  }

  // Export as individual files
  let exported = 0

  for (const command of commands) {
    const fileName = `${command.name}.sh`
    const filePath = path.join(directory, fileName)

    // Create a script file with metadata header
    const content = `#!/bin/bash
# Scaffold Script: ${command.name}
# Description: ${command.description || 'No description'}
# Platform: ${command.platform}
# Original Platform: ${command.original_platform}
# Script Type: ${command.script_type}
# Created: ${command.createdAt}
# Updated: ${command.updatedAt}
${command.alias ? `# Alias: ${command.alias}` : ''}

${command.script_original}`

    fs.writeFileSync(filePath, content)

    // Make executable on Unix
    if (process.platform !== 'win32') {
      fs.chmodSync(filePath, '755')
    }

    exported++
  }

  // Create README
  const readmeContent = `# Exported Scaffold Scripts

Exported on: ${new Date().toISOString()}
Total scripts: ${commands.length}

## Scripts:
${commands
  .map(
    (cmd) =>
      `- **${cmd.name}** ${cmd.alias ? `(${cmd.alias})` : ''}: ${
        cmd.description || 'No description'
      }`,
  )
  .join('\n')}

## Usage:
Each script is exported as an individual file. You can run them directly:
\`\`\`bash
./${commands[0]?.name}.sh
\`\`\`

To recreate in scaffold-scripts (if you reinstall):
\`\`\`bash
scaffold add ${commands[0]?.name} ./${commands[0]?.name}.sh
\`\`\`
`

  fs.writeFileSync(path.join(directory, 'README.md'), readmeContent)

  console.log(chalk.green(`${sym.check()} Exported ${exported} scripts as individual files`))
  console.log(chalk.blue(`${sym.book()} See README.md in ${directory} for usage instructions`))
}

// Helper function for user input
async function askUser(question: string, defaultValue: string = 'n'): Promise<string> {
  return new Promise((resolve) => {
    console.log(chalk.yellow(question))
    process.stdout.write('> ')

    process.stdin.once('data', (data) => {
      const response = data.toString().trim().toLowerCase()
      resolve(response || defaultValue)
    })
  })
}

// Uninstall command
async function uninstallCommand() {
  const fs = await import('fs')
  const path = await import('path')
  const os = await import('os')
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  console.log(chalk.blue(`${sym.trash()} Scaffold Scripts CLI Uninstaller`))
  console.log(chalk.blue('===================================='))

  // Check if user has any scripts
  const commands = await getDatabase().listCommands()
  let exportDirectory: string | null = null
  let keepData = false

  if (commands.length > 0) {
    console.log(chalk.blue(`${sym.list()} You have ${commands.length} saved scripts:`))
    commands.forEach((cmd) => {
      const alias = cmd.alias ? ` (${cmd.alias})` : ''
      console.log(chalk.cyan(`  • ${cmd.name}${alias}`))
    })
    console.log('')

    // Ask about exporting
    const exportResponse = await askUser(
      'Do you want to export your scripts before uninstalling? (y/N)',
    )

    if (exportResponse === 'y' || exportResponse === 'yes') {
      const defaultDir = './my-scaffold-scripts'
      const dirResponse = await askUser(`Export directory (default: ${defaultDir}):`)
      exportDirectory = dirResponse.trim() || defaultDir

      console.log(chalk.blue(`${sym.package()} Exporting scripts to: ${exportDirectory}`))
      await exportCommand(exportDirectory)
      console.log('')
    } else {
      // Ask about keeping data
      const keepResponse = await askUser('Keep your scripts in ~/.scaffold-scripts? (y/N)')
      keepData = keepResponse === 'y' || keepResponse === 'yes'
    }
  }

  console.log(chalk.blue(`${sym.trash()} Uninstalling Scaffold Scripts CLI...`))

  try {
    // Uninstall package
    console.log(chalk.yellow(`${sym.package()} Removing scaffold-scripts package...`))
    try {
      await execAsync('npm uninstall -g scaffold-scripts')
      console.log(chalk.green(`${sym.check()} Package removed`))
    } catch (error) {
      console.log(
        chalk.yellow(
          `${sym.warning()} Could not remove via npm (this is normal if installed differently)`,
        ),
      )
    }

    // Handle local data directory
    const dataDir = path.join(os.homedir(), '.scaffold-scripts')
    if (fs.existsSync(dataDir)) {
      if (!keepData && !exportDirectory) {
        console.log(chalk.yellow(`${sym.folder()} Removing local data directory...`))
        fs.rmSync(dataDir, { recursive: true, force: true })
        console.log(chalk.green(`${sym.check()} Local data directory removed`))
      } else {
        console.log(chalk.blue(`${sym.info()} Local data preserved at: ` + dataDir))
      }
    } else {
      console.log(chalk.blue(`${sym.info()} No local data directory found`))
    }

    console.log(chalk.green(`${sym.party()} Uninstallation complete!`))
    console.log('')
    console.log(chalk.blue(`${sym.memo()} Summary:`))
    console.log(chalk.blue(`  ${sym.check()} Removed scaffold command`))

    if (exportDirectory) {
      console.log(chalk.blue(`  ${sym.check()} Exported scripts to: ${exportDirectory}`))
    } else if (keepData) {
      console.log(chalk.blue(`  ${sym.info()} Scripts preserved in ~/.scaffold-scripts`))
    } else if (commands.length > 0) {
      console.log(chalk.blue(`  ${sym.check()} Removed local data directory`))
    }

    console.log('')
    console.log(chalk.blue('Thank you for using Scaffold Scripts CLI!'))
    console.log(chalk.yellow('Please restart your terminal for changes to take effect'))

    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red(`${sym.cross()} Error during uninstallation:`), error.message)
    console.log(chalk.yellow('You may need to remove manually or use the online uninstaller:'))
    console.log(
      chalk.blue(
        'Unix: curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.sh | bash',
      ),
    )
    console.log(
      chalk.blue(
        'Windows: irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.ps1 | iex',
      ),
    )
  }
}

// Handle process termination (only in production, not during testing)
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  process.on('SIGINT', () => {
    if (db) db.close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    if (db) db.close()
    process.exit(0)
  })
}

// Parse command line arguments with error handling
try {
  program.parse()
} catch (error: any) {
  // Handle Commander.js errors gracefully
  if (error.code === 'commander.missingArgument') {
    // Extract command name from argv or error
    let commandName = 'unknown';
    if (process.argv.length > 2) {
      commandName = process.argv[2];
    }
    if (error.command?.name()) {
      commandName = error.command.name();
    }
    
    UsageHelper.displayError(
      `Missing required arguments`,
      `Use: scripts ${commandName} --help for usage information`
    );
    UsageHelper.displayCommandHelp(commandName);
    process.exit(1);
  } else if (error.code === 'commander.unknownOption') {
    UsageHelper.displayError(
      `Unknown option: ${error.option}`,
      'Use --help to see available options'
    );
    process.exit(1);
  } else if (error.code === 'commander.unknownCommand') {
    UsageHelper.displayError(
      `Unknown command: ${error.command}`,
      'Use --help to see available commands'
    );
    process.exit(1);
  } else if (error.code === 'commander.version') {
    // Version command succeeded - just exit cleanly
    process.exit(0);
  } else if (error.code === 'commander.helpDisplayed' || error.message === '(outputHelp)') {
    // Help command succeeded - just exit cleanly
    process.exit(0);
  } else {
    // Only show error for actual errors
    if (error.message && error.message !== '(outputHelp)' && !error.message.match(/^\d+\.\d+\.\d+$/)) {
      UsageHelper.displayError(error.message, 'Check your command syntax and try again');
    }
    process.exit(error.exitCode || 1);
  }
}
