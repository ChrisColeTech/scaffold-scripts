#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ScaffoldDatabase, ScaffoldCommand } from './database.js';
import { ScriptExecutor } from './scriptExecutor.js';
import { ScriptValidator } from './scriptValidator.js';
import { ScriptProcessor } from './scriptProcessor.js';
import { sym } from './symbols.js';

const program = new Command();
const db = new ScaffoldDatabase();
const executor = new ScriptExecutor();
const validator = new ScriptValidator();
const processor = new ScriptProcessor();

program
  .name('scaffold')
  .description('CLI tool for managing and executing scaffold scripts')
  .version('1.0.0');

// Main scaffolding commands
program
  .argument('[script-name]', 'run script with specified name')
  .option('-v, --view', 'view script details instead of executing')
  .action(async (scriptName, options) => {
    try {
      if (scriptName) {
        await handleScriptCommand(scriptName, options.view);
      } else {
        console.log(chalk.yellow('Please specify a script name or use --help for usage information.'));
        program.help();
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Add command
program
  .command('add')
  .alias('a')
  .description('add a new script')
  .argument('<name>', 'script name')
  .argument('<scriptPath>', 'path to script file')
  .option('-p, --platform <platform>', 'target platform: all, windows, or unix', 'all')
  .option('--strict', 'use strict validation')
  .option('--no-validate', 'skip validation (use with caution)')
  .action(async (name, scriptPath, options) => {
    try {
      await addCommand(name, scriptPath, options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Update command
program
  .command('update')
  .alias('u')
  .description('update an existing script')
  .argument('<name>', 'script name')
  .argument('<scriptPath>', 'path to new script file')
  .option('-p, --platform <platform>', 'update target platform')
  .option('--strict', 'use strict validation')
  .action(async (name, scriptPath, options) => {
    try {
      await updateCommand(name, scriptPath, options);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Remove command
program
  .command('remove')
  .alias('r')
  .description('remove a script')
  .argument('<name>', 'script name')
  .action(async (name) => {
    try {
      await removeCommand(name);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// List commands
program
  .command('list')
  .alias('l')
  .description('list available scripts')
  .option('-d, --detailed', 'show detailed information')
  .action(async (options) => {
    try {
      await listCommands(options.detailed);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('export all scripts to a directory')
  .argument('<directory>', 'directory to export scripts to')
  .action(async (directory) => {
    try {
      await exportCommand(directory);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Uninstall command
program
  .command('uninstall')
  .description('uninstall scaffold-scripts CLI')
  .action(async () => {
    try {
      await uninstallCommand();
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Handle script commands
async function handleScriptCommand(scriptName: string, viewOnly: boolean = false) {
  // Try to find by name first, then by alias
  let command = await db.getCommand(scriptName);
  if (!command) {
    command = await db.getCommandByAlias(scriptName);
  }

  if (!command) {
    console.error(chalk.red(`Script "${scriptName}" not found.`));
    console.log(chalk.yellow(`\\nAvailable scripts:`));
    const commands = await db.listCommands();
    if (commands.length === 0) {
      console.log(chalk.gray(`  No scripts available.`));
      console.log(chalk.yellow(`\\nAdd one with: scaffold add ${scriptName} /path/to/script.txt`));
    } else {
      commands.forEach(cmd => {
        const alias = cmd.alias ? ` (${cmd.alias})` : '';
        console.log(chalk.cyan(`  • ${cmd.name}${alias}`));
      });
    }
    return;
  }

  if (viewOnly) {
    displayCommandDetails(command);
  } else {
    console.log(chalk.blue(`Executing script: ${command.name}`));
    if (command.description) {
      console.log(chalk.gray(command.description));
    }
    
    const bestScript = processor.getBestScript(command);
    const result = await executor.executeScript(bestScript, command.platform);
    console.log(chalk.green('✅ Script completed successfully!'));
    
    if (result.stdout) {
      console.log('\\n--- Output ---');
      console.log(result.stdout);
    }
  }
}


// Add new command - Production Ready Version
async function addCommand(name: string, scriptPath: string, options: any) {
  try {
    console.log(chalk.blue(`📦 Processing script: ${name}`));
    
    // Process the script using the production-ready processor
    const processedScript = await processor.processScriptFile(scriptPath, {
      strict: options.strict || false,
      allowNetworkAccess: !options.strict,
      allowSystemModification: !options.strict
    });

    // Display validation results
    console.log('\n📋 Validation Results:');
    if (processedScript.validation.isValid) {
      console.log(chalk.green('✅ Script validation passed'));
    } else {
      console.log(chalk.red('❌ Script validation failed'));
    }

    if (processedScript.validation.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      processedScript.validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

    if (processedScript.validation.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      processedScript.validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    // Fail if validation failed and not overridden
    if (!processedScript.validation.isValid && options.validate !== false) {
      console.error(chalk.red('\n❌ Cannot add command due to validation errors.'));
      console.log(chalk.gray('Use --no-validate to skip validation (not recommended).'));
      return;
    }

    // Display script processing info
    console.log(chalk.blue(`\n🔍 Script Analysis:`));
    console.log(chalk.gray(`   Original Platform: ${processedScript.originalPlatform}`));
    console.log(chalk.gray(`   Script Type: ${processedScript.scriptType}`));
    console.log(chalk.gray(`   Windows Version: ${processedScript.windows ? '✅ Generated' : '❌ Not available'}`));
    console.log(chalk.gray(`   Unix Version: ${processedScript.unix ? '✅ Generated' : '❌ Not available'}`));
    console.log(chalk.gray(`   Cross-Platform: ${processedScript.crossPlatform ? '✅ Generated' : '❌ Not available'}`));

    // Create the command object
    const command = processor.createCommand(
      name,
      processedScript,
      {
        platform: options.platform
      }
    );

    // Save to database
    await db.addCommand(command);
    
    console.log(chalk.green(`\n✅ Added script "${name}"`));

    // Show platform compatibility info
    const compatibility = processor.validatePlatformCompatibility(command as any, process.platform);
    if (!compatibility.compatible || compatibility.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Platform Compatibility:'));
      compatibility.warnings.forEach(warning => {
        console.log(chalk.yellow(`   • ${warning}`));
      });
      if (compatibility.recommendations.length > 0) {
        console.log(chalk.blue('\n💡 Recommendations:'));
        compatibility.recommendations.forEach(rec => {
          console.log(chalk.blue(`   • ${rec}`));
        });
      }
    }

  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to add command: ${error.message}`));
    throw error;
  }
}

// Update existing command - Production Ready Version
async function updateCommand(name: string, scriptPath: string, options: any) {
  try {
    const existing = await db.getCommand(name);
    if (!existing) {
      console.error(chalk.red(`Script "${name}" not found.`));
      return;
    }

    console.log(chalk.blue(`📦 Updating script: ${name}`));
    
    // Process the new script using the production-ready processor
    const processedScript = await processor.processScriptFile(scriptPath, {
      strict: options.strict || false,
      allowNetworkAccess: !options.strict,
      allowSystemModification: !options.strict
    });

    // Display validation results
    console.log('\n📋 Validation Results:');
    if (processedScript.validation.isValid) {
      console.log(chalk.green('✅ Script validation passed'));
    } else {
      console.log(chalk.red('❌ Script validation failed'));
    }

    if (processedScript.validation.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      processedScript.validation.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

    if (processedScript.validation.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      processedScript.validation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    // Fail if validation failed and not overridden
    if (!processedScript.validation.isValid && options.validate !== false) {
      console.error(chalk.red('\n❌ Cannot update command due to validation errors.'));
      console.log(chalk.gray('Use --no-validate to skip validation (not recommended).'));
      return;
    }

    // Display script processing info
    console.log(chalk.blue(`\n🔍 Script Analysis:`));
    console.log(chalk.gray(`   Original Platform: ${processedScript.originalPlatform}`));
    console.log(chalk.gray(`   Script Type: ${processedScript.scriptType}`));
    console.log(chalk.gray(`   Windows Version: ${processedScript.windows ? '✅ Generated' : '❌ Not available'}`));
    console.log(chalk.gray(`   Unix Version: ${processedScript.unix ? '✅ Generated' : '❌ Not available'}`));
    console.log(chalk.gray(`   Cross-Platform: ${processedScript.crossPlatform ? '✅ Generated' : '❌ Not available'}`));

    // Prepare updates with new multi-script fields
    const updates: Partial<ScaffoldCommand> = {
      script_original: processedScript.original,
      script_windows: processedScript.windows,
      script_unix: processedScript.unix,
      script_cross_platform: processedScript.crossPlatform,
      original_platform: processedScript.originalPlatform,
      script_type: processedScript.scriptType as any
    };
    
    if (options.platform !== undefined) updates.platform = options.platform;

    const success = await db.updateCommand(name, updates);
    if (success) {
      console.log(chalk.green(`\n✅ Updated script "${name}"`));

      // Show platform compatibility info for updated command
      const updatedCommand = { ...existing, ...updates } as ScaffoldCommand;
      const compatibility = processor.validatePlatformCompatibility(updatedCommand, process.platform);
      if (!compatibility.compatible || compatibility.warnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Platform Compatibility:'));
        compatibility.warnings.forEach(warning => {
          console.log(chalk.yellow(`   • ${warning}`));
        });
        if (compatibility.recommendations.length > 0) {
          console.log(chalk.blue('\n💡 Recommendations:'));
          compatibility.recommendations.forEach(rec => {
            console.log(chalk.blue(`   • ${rec}`));
          });
        }
      }
    } else {
      console.error(chalk.red('❌ Failed to update command.'));
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to update command: ${error.message}`));
    throw error;
  }
}

// Remove command
async function removeCommand(name: string) {
  const success = await db.removeCommand(name);
  if (success) {
    console.log(chalk.green(`✅ Removed script "${name}"`));
  } else {
    console.error(chalk.red(`Script "${name}" not found.`));
  }
}

// List commands
async function listCommands(detailed: boolean = false) {
  const commands = await db.listCommands();
  
  if (commands.length === 0) {
    console.log(chalk.gray('No scripts available.'));
    return;
  }

  console.log(chalk.blue(`\\n📋 Available Scripts:`));
  
  commands.forEach(cmd => {
    const alias = cmd.alias ? chalk.gray(` (${cmd.alias})`) : '';
    const platform = cmd.platform !== 'all' ? chalk.gray(` [${cmd.platform}]`) : '';
    
    if (detailed) {
      console.log(chalk.cyan(`  • ${cmd.name}${alias}${platform}`));
      if (cmd.description) {
        console.log(chalk.gray(`    ${cmd.description}`));
      }
      console.log(chalk.gray(`    Updated: ${new Date(cmd.updatedAt).toLocaleDateString()}`));
    } else {
      console.log(chalk.cyan(`  • ${cmd.name}${alias}${platform}`));
    }
  });
}

// Display command details - Production Ready Version
function displayCommandDetails(command: any) {
  console.log(chalk.blue(`\\n📄 Command Details: ${command.name}`));
  console.log(chalk.gray('═'.repeat(60)));
  
  // Basic info
  console.log(chalk.yellow('Type:'), chalk.cyan(command.type));
  console.log(chalk.yellow('Name:'), chalk.cyan(command.name));
  if (command.alias) {
    console.log(chalk.yellow('Alias:'), chalk.cyan(command.alias));
  }
  if (command.description) {
    console.log(chalk.yellow('Description:'), command.description);
  }
  console.log(chalk.yellow('Platform Support:'), chalk.cyan(command.platform));
  console.log(chalk.yellow('Created:'), new Date(command.createdAt).toLocaleString());
  console.log(chalk.yellow('Updated:'), new Date(command.updatedAt).toLocaleString());

  // Script metadata
  if (command.script_type) {
    console.log('\\n' + chalk.blue('📋 Script Information:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(chalk.yellow('Original Platform:'), chalk.cyan(command.original_platform));
    console.log(chalk.yellow('Script Type:'), chalk.cyan(command.script_type));
  }

  // Get version info using processor
  const versionInfo = processor.getScriptVersionInfo(command);
  
  console.log('\\n' + chalk.blue('📜 Script Versions:'));
  console.log(chalk.gray('─'.repeat(40)));
  
  // Original script
  console.log(chalk.yellow(`\\n🔸 Original (${versionInfo.original.platform}, ${versionInfo.original.type}):`));
  console.log(chalk.gray(versionInfo.original.content.split('\\n').slice(0, 5).join('\\n') + 
              (versionInfo.original.content.split('\\n').length > 5 ? '\\n...' : '')));
  
  // Windows version
  if (versionInfo.windows?.available) {
    console.log(chalk.yellow('\\n🔸 Windows Version:'));
    console.log(chalk.gray(versionInfo.windows.content.split('\\n').slice(0, 3).join('\\n') + '...'));
  }
  
  // Unix version
  if (versionInfo.unix?.available) {
    console.log(chalk.yellow('\\n🔸 Unix Version:'));
    console.log(chalk.gray(versionInfo.unix.content.split('\\n').slice(0, 3).join('\\n') + '...'));
  }
  
  // Cross-platform version
  if (versionInfo.crossPlatform?.available) {
    console.log(chalk.yellow('\\n🔸 Cross-Platform Version:'));
    console.log(chalk.gray(versionInfo.crossPlatform.content.split('\\n').slice(0, 3).join('\\n') + '...'));
  }

  // Best version for current platform
  console.log('\\n' + chalk.blue(`🎯 Best for Current Platform (${versionInfo.bestForCurrent.version}):`));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(versionInfo.bestForCurrent.content);

  // Platform compatibility
  const compatibility = processor.validatePlatformCompatibility(command, process.platform);
  if (!compatibility.compatible || compatibility.warnings.length > 0) {
    console.log('\\n' + chalk.yellow('⚠️  Platform Compatibility:'));
    console.log(chalk.gray('─'.repeat(40)));
    compatibility.warnings.forEach(warning => {
      console.log(chalk.yellow(`• ${warning}`));
    });
    if (compatibility.recommendations.length > 0) {
      console.log('\\n' + chalk.blue('💡 Recommendations:'));
      compatibility.recommendations.forEach(rec => {
        console.log(chalk.blue(`• ${rec}`));
      });
    }
  } else {
    console.log('\\n' + chalk.green('✅ Fully compatible with current platform'));
  }
}

// Export command
async function exportCommand(directory: string) {
  const fs = await import('fs');
  const path = await import('path');

  console.log(chalk.blue(`${sym.package()} Exporting scripts to: ${directory}`));

  // Create export directory
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  // Get all commands
  const commands = await db.listCommands();
  
  if (commands.length === 0) {
    console.log(chalk.yellow('No scripts to export'));
    return;
  }

  // Export as individual files
  let exported = 0;
  
  for (const command of commands) {
    const fileName = `${command.name}.sh`;
    const filePath = path.join(directory, fileName);
    
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

${command.script_original}`;

    fs.writeFileSync(filePath, content);
    
    // Make executable on Unix
    if (process.platform !== 'win32') {
      fs.chmodSync(filePath, '755');
    }
    
    exported++;
  }
  
  // Create README
  const readmeContent = `# Exported Scaffold Scripts

Exported on: ${new Date().toISOString()}
Total scripts: ${commands.length}

## Scripts:
${commands.map(cmd => `- **${cmd.name}** ${cmd.alias ? `(${cmd.alias})` : ''}: ${cmd.description || 'No description'}`).join('\n')}

## Usage:
Each script is exported as an individual file. You can run them directly:
\`\`\`bash
./${commands[0]?.name}.sh
\`\`\`

To recreate in scaffold-scripts (if you reinstall):
\`\`\`bash
scaffold add ${commands[0]?.name} ./${commands[0]?.name}.sh
\`\`\`
`;
  
  fs.writeFileSync(path.join(directory, 'README.md'), readmeContent);
  
  console.log(chalk.green(`${sym.check()} Exported ${exported} scripts as individual files`));
  console.log(chalk.blue(`${sym.book()} See README.md in ${directory} for usage instructions`));
}

// Helper function for user input
async function askUser(question: string, defaultValue: string = 'n'): Promise<string> {
  return new Promise((resolve) => {
    console.log(chalk.yellow(question));
    process.stdout.write('> ');
    
    process.stdin.once('data', (data) => {
      const response = data.toString().trim().toLowerCase();
      resolve(response || defaultValue);
    });
  });
}

// Uninstall command
async function uninstallCommand() {
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  console.log(chalk.blue(`${sym.trash()} Scaffold Scripts CLI Uninstaller`));
  console.log(chalk.blue('===================================='));

  // Check if user has any scripts
  const commands = await db.listCommands();
  let exportDirectory: string | null = null;
  let keepData = false;

  if (commands.length > 0) {
    console.log(chalk.blue(`${sym.list()} You have ${commands.length} saved scripts:`));
    commands.forEach(cmd => {
      const alias = cmd.alias ? ` (${cmd.alias})` : '';
      console.log(chalk.cyan(`  • ${cmd.name}${alias}`));
    });
    console.log('');

    // Ask about exporting
    const exportResponse = await askUser('Do you want to export your scripts before uninstalling? (y/N)');
    
    if (exportResponse === 'y' || exportResponse === 'yes') {
      const defaultDir = './my-scaffold-scripts';
      const dirResponse = await askUser(`Export directory (default: ${defaultDir}):`);
      exportDirectory = dirResponse.trim() || defaultDir;
      
      console.log(chalk.blue(`${sym.package()} Exporting scripts to: ${exportDirectory}`));
      await exportCommand(exportDirectory);
      console.log('');
    } else {
      // Ask about keeping data
      const keepResponse = await askUser('Keep your scripts in ~/.scaffold-scripts? (y/N)');
      keepData = keepResponse === 'y' || keepResponse === 'yes';
    }
  }

  console.log(chalk.blue(`${sym.trash()} Uninstalling Scaffold Scripts CLI...`));

  try {
    // Uninstall package
    console.log(chalk.yellow(`${sym.package()} Removing scaffold-scripts package...`));
    try {
      await execAsync('npm uninstall -g scaffold-scripts');
      console.log(chalk.green(`${sym.check()} Package removed`));
    } catch (error) {
      console.log(chalk.yellow(`${sym.warning()} Could not remove via npm (this is normal if installed differently)`));
    }

    // Handle local data directory
    const dataDir = path.join(os.homedir(), '.scaffold-scripts');
    if (fs.existsSync(dataDir)) {
      if (!keepData && !exportDirectory) {
        console.log(chalk.yellow(`${sym.folder()} Removing local data directory...`));
        fs.rmSync(dataDir, { recursive: true, force: true });
        console.log(chalk.green(`${sym.check()} Local data directory removed`));
      } else {
        console.log(chalk.blue(`${sym.info()} Local data preserved at: ` + dataDir));
      }
    } else {
      console.log(chalk.blue(`${sym.info()} No local data directory found`));
    }

    console.log(chalk.green(`${sym.party()} Uninstallation complete!`));
    console.log('');
    console.log(chalk.blue(`${sym.memo()} Summary:`));
    console.log(chalk.blue(`  ${sym.check()} Removed scaffold command`));
    
    if (exportDirectory) {
      console.log(chalk.blue(`  ${sym.check()} Exported scripts to: ${exportDirectory}`));
    } else if (keepData) {
      console.log(chalk.blue(`  ${sym.info()} Scripts preserved in ~/.scaffold-scripts`));
    } else if (commands.length > 0) {
      console.log(chalk.blue(`  ${sym.check()} Removed local data directory`));
    }
    
    console.log('');
    console.log(chalk.blue('Thank you for using Scaffold Scripts CLI!'));
    console.log(chalk.yellow('Please restart your terminal for changes to take effect'));
    
    process.exit(0);
    
  } catch (error: any) {
    console.error(chalk.red('❌ Error during uninstallation:'), error.message);
    console.log(chalk.yellow('You may need to remove manually or use the online uninstaller:'));
    console.log(chalk.blue('Unix: curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.sh | bash'));
    console.log(chalk.blue('Windows: irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.ps1 | iex'));
  }
}

// Handle process termination
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

// Parse command line arguments
program.parse();