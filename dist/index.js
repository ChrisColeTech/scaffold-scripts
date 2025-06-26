#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const database_js_1 = require("./database.js");
const scriptExecutor_js_1 = require("./scriptExecutor.js");
const scriptValidator_js_1 = require("./scriptValidator.js");
const scriptProcessor_js_1 = require("./scriptProcessor.js");
const program = new commander_1.Command();
const db = new database_js_1.ScaffoldDatabase();
const executor = new scriptExecutor_js_1.ScriptExecutor();
const validator = new scriptValidator_js_1.ScriptValidator();
const processor = new scriptProcessor_js_1.ScriptProcessor();
program
    .name('scaffold')
    .description('CLI tool for scaffolding frontend and backend projects')
    .version('1.0.0');
// Main scaffolding commands with shorthand options
program
    .option('-f, --frontend <framework>', 'scaffold frontend with specified framework')
    .option('-b, --backend <framework>', 'scaffold backend with specified framework')
    .option('-i, --init [name]', 'run initialization script (default: "default")')
    .option('-v, --view', 'view command details instead of executing')
    .action(async (options) => {
    try {
        if (options.frontend) {
            await handleFrameworkCommand('frontend', options.frontend, options.view);
        }
        else if (options.backend) {
            await handleFrameworkCommand('backend', options.backend, options.view);
        }
        else if (options.init !== undefined) {
            const initName = typeof options.init === 'string' ? options.init : 'default';
            await handleInitCommand(initName, options.view);
        }
        else {
            console.log(chalk_1.default.yellow('Please specify an action. Use --help for usage information.'));
            program.help();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Add command
program
    .command('add')
    .alias('-a')
    .description('add a new scaffold command')
    .argument('<type>', 'command type: frontend, backend, or init')
    .argument('[name]', 'command name (not required for init)')
    .argument('<scriptPath>', 'path to script file')
    .option('-p, --platform <platform>', 'target platform: all, windows, or unix', 'all')
    .option('--strict', 'use strict validation')
    .option('--no-validate', 'skip validation (use with caution)')
    .action(async (type, name, scriptPath, options) => {
    try {
        // Handle init commands (name is optional)
        if (type === 'init') {
            if (!scriptPath) {
                scriptPath = name; // name becomes scriptPath for init
                name = 'default';
            }
        }
        if (!name && type !== 'init') {
            console.error(chalk_1.default.red('Name is required for frontend and backend commands'));
            process.exit(1);
        }
        const finalName = name || 'default';
        await addCommand(type, finalName, scriptPath, options);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Update command
program
    .command('update')
    .alias('-u')
    .description('update an existing scaffold command')
    .argument('<type>', 'command type: frontend, backend, or init')
    .argument('[name]', 'command name (defaults to "default" for init)')
    .argument('<scriptPath>', 'path to new script file')
    .option('-p, --platform <platform>', 'update target platform')
    .option('--strict', 'use strict validation')
    .action(async (type, name, scriptPath, options) => {
    try {
        if (type === 'init' && !scriptPath) {
            scriptPath = name;
            name = 'default';
        }
        const finalName = name || 'default';
        await updateCommand(type, finalName, scriptPath, options);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Remove command
program
    .command('remove')
    .alias('-r')
    .description('remove a scaffold command')
    .argument('<type>', 'command type: frontend, backend, or init')
    .argument('[name]', 'command name (defaults to "default" for init)')
    .action(async (type, name) => {
    try {
        const finalName = name || (type === 'init' ? 'default' : '');
        if (!finalName && type !== 'init') {
            console.error(chalk_1.default.red('Name is required for frontend and backend commands'));
            process.exit(1);
        }
        await removeCommand(type, finalName);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// List commands
program
    .command('list')
    .alias('-l')
    .description('list available scaffold commands')
    .option('-t, --type <type>', 'filter by type: frontend, backend, or init')
    .option('-d, --detailed', 'show detailed information')
    .action(async (options) => {
    try {
        await listCommands(options.type, options.detailed);
    }
    catch (error) {
        console.error(chalk_1.default.red(`Error: ${error.message}`));
        process.exit(1);
    }
});
// Handle framework commands (frontend/backend)
async function handleFrameworkCommand(type, framework, viewOnly = false) {
    // Try to find by name first, then by alias
    let command = await db.getCommand(type, framework);
    if (!command) {
        command = await db.getCommandByAlias(framework);
        if (command && command.type !== type) {
            command = null; // Alias doesn't match the requested type
        }
    }
    if (!command) {
        console.error(chalk_1.default.red(`${type} command "${framework}" not found.`));
        console.log(chalk_1.default.yellow(`\\nAvailable ${type} commands:`));
        const commands = await db.listCommands(type);
        if (commands.length === 0) {
            console.log(chalk_1.default.gray(`  No ${type} commands available.`));
            console.log(chalk_1.default.yellow(`\\nAdd one with: scaffold add ${type} ${framework} /path/to/script.txt`));
        }
        else {
            commands.forEach(cmd => {
                const alias = cmd.alias ? ` (${cmd.alias})` : '';
                console.log(chalk_1.default.cyan(`  • ${cmd.name}${alias}`));
            });
        }
        return;
    }
    if (viewOnly) {
        displayCommandDetails(command);
    }
    else {
        console.log(chalk_1.default.blue(`Executing ${type} scaffold: ${command.name}`));
        if (command.description) {
            console.log(chalk_1.default.gray(command.description));
        }
        const bestScript = processor.getBestScript(command);
        const result = await executor.executeScript(bestScript, command.platform);
        console.log(chalk_1.default.green('✅ Scaffold completed successfully!'));
        if (result.stdout) {
            console.log('\\n--- Output ---');
            console.log(result.stdout);
        }
    }
}
// Handle init command with "first or default" logic
async function handleInitCommand(name, viewOnly = false) {
    let command = await db.getInitCommand(name);
    // If no specific name provided (name === 'default'), use "first or default" logic
    if (!command && name === 'default') {
        const initCommands = await db.listCommands('init');
        if (initCommands.length === 0) {
            console.error(chalk_1.default.red('No init scripts found.'));
            console.log(chalk_1.default.yellow(`\\nTo add an init script, use:`));
            console.log(chalk_1.default.cyan(`  scaffold add init my-setup /path/to/init-script.sh`));
            console.log(chalk_1.default.cyan(`  scaffold a init default /path/to/default-init.sh`));
            return;
        }
        else if (initCommands.length === 1) {
            // Only one init script - use it
            command = initCommands[0];
            console.log(chalk_1.default.blue(`Using the only available init script: ${command.name}`));
        }
        else {
            // Multiple scripts - try to find one named "default"
            const defaultCommand = initCommands.find(cmd => cmd.name === 'default');
            if (defaultCommand) {
                command = defaultCommand;
                console.log(chalk_1.default.blue(`Using default init script: ${command.name}`));
            }
            else {
                // No default found - show available options
                console.error(chalk_1.default.red('Multiple init scripts found, but no "default" script.'));
                console.log(chalk_1.default.yellow(`\\nAvailable init scripts:`));
                initCommands.forEach(cmd => {
                    const desc = cmd.description ? ` - ${cmd.description}` : '';
                    console.log(chalk_1.default.cyan(`  • ${cmd.name}${desc}`));
                });
                console.log(chalk_1.default.yellow(`\\nRun with: scaffold -i <script-name>`));
                console.log(chalk_1.default.yellow(`Or add a default: scaffold add init default /path/to/default-script.sh`));
                return;
            }
        }
    }
    else if (!command) {
        console.error(chalk_1.default.red(`Init script "${name}" not found.`));
        console.log(chalk_1.default.yellow(`\\nTo add this init script, use:`));
        console.log(chalk_1.default.cyan(`  scaffold add init ${name} /path/to/${name}-script.sh`));
        // Show available init scripts if any exist
        const initCommands = await db.listCommands('init');
        if (initCommands.length > 0) {
            console.log(chalk_1.default.yellow(`\\nAvailable init scripts:`));
            initCommands.forEach(cmd => {
                const desc = cmd.description ? ` - ${cmd.description}` : '';
                console.log(chalk_1.default.cyan(`  • ${cmd.name}${desc}`));
            });
        }
        return;
    }
    if (viewOnly) {
        displayCommandDetails(command);
    }
    else {
        console.log(chalk_1.default.blue(`Running initialization script: ${command.name}`));
        if (command.description) {
            console.log(chalk_1.default.gray(command.description));
        }
        const bestScript = processor.getBestScript(command);
        const result = await executor.executeScript(bestScript, command.platform);
        console.log(chalk_1.default.green('✅ Initialization completed successfully!'));
        if (result.stdout) {
            console.log('\\n--- Output ---');
            console.log(result.stdout);
        }
    }
}
// Add new command - Production Ready Version
async function addCommand(type, name, scriptPath, options) {
    try {
        console.log(chalk_1.default.blue(`📦 Processing ${type} script: ${name}`));
        // Process the script using the production-ready processor
        const processedScript = await processor.processScriptFile(scriptPath, {
            strict: options.strict || false,
            allowNetworkAccess: !options.strict,
            allowSystemModification: !options.strict
        });
        // Display validation results
        console.log('\n📋 Validation Results:');
        if (processedScript.validation.isValid) {
            console.log(chalk_1.default.green('✅ Script validation passed'));
        }
        else {
            console.log(chalk_1.default.red('❌ Script validation failed'));
        }
        if (processedScript.validation.errors.length > 0) {
            console.log(chalk_1.default.red('\nErrors:'));
            processedScript.validation.errors.forEach(error => {
                console.log(chalk_1.default.red(`  • ${error}`));
            });
        }
        if (processedScript.validation.warnings.length > 0) {
            console.log(chalk_1.default.yellow('\nWarnings:'));
            processedScript.validation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
        }
        // Fail if validation failed and not overridden
        if (!processedScript.validation.isValid && options.validate !== false) {
            console.error(chalk_1.default.red('\n❌ Cannot add command due to validation errors.'));
            console.log(chalk_1.default.gray('Use --no-validate to skip validation (not recommended).'));
            return;
        }
        // Display script processing info
        console.log(chalk_1.default.blue(`\n🔍 Script Analysis:`));
        console.log(chalk_1.default.gray(`   Original Platform: ${processedScript.originalPlatform}`));
        console.log(chalk_1.default.gray(`   Script Type: ${processedScript.scriptType}`));
        console.log(chalk_1.default.gray(`   Windows Version: ${processedScript.windows ? '✅ Generated' : '❌ Not available'}`));
        console.log(chalk_1.default.gray(`   Unix Version: ${processedScript.unix ? '✅ Generated' : '❌ Not available'}`));
        console.log(chalk_1.default.gray(`   Cross-Platform: ${processedScript.crossPlatform ? '✅ Generated' : '❌ Not available'}`));
        // Create the command object
        const command = processor.createCommand(type, name, processedScript, {
            platform: options.platform
        });
        // Save to database
        await db.addCommand(command);
        console.log(chalk_1.default.green(`\n✅ Added ${type} command "${name}"`));
        // Show platform compatibility info
        const compatibility = processor.validatePlatformCompatibility(command, process.platform);
        if (!compatibility.compatible || compatibility.warnings.length > 0) {
            console.log(chalk_1.default.yellow('\n⚠️  Platform Compatibility:'));
            compatibility.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`   • ${warning}`));
            });
            if (compatibility.recommendations.length > 0) {
                console.log(chalk_1.default.blue('\n💡 Recommendations:'));
                compatibility.recommendations.forEach(rec => {
                    console.log(chalk_1.default.blue(`   • ${rec}`));
                });
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to add command: ${error.message}`));
        throw error;
    }
}
// Update existing command - Production Ready Version
async function updateCommand(type, name, scriptPath, options) {
    try {
        const existing = await db.getCommand(type, name);
        if (!existing) {
            console.error(chalk_1.default.red(`${type} command "${name}" not found.`));
            return;
        }
        console.log(chalk_1.default.blue(`📦 Updating ${type} script: ${name}`));
        // Process the new script using the production-ready processor
        const processedScript = await processor.processScriptFile(scriptPath, {
            strict: options.strict || false,
            allowNetworkAccess: !options.strict,
            allowSystemModification: !options.strict
        });
        // Display validation results
        console.log('\n📋 Validation Results:');
        if (processedScript.validation.isValid) {
            console.log(chalk_1.default.green('✅ Script validation passed'));
        }
        else {
            console.log(chalk_1.default.red('❌ Script validation failed'));
        }
        if (processedScript.validation.errors.length > 0) {
            console.log(chalk_1.default.red('\nErrors:'));
            processedScript.validation.errors.forEach(error => {
                console.log(chalk_1.default.red(`  • ${error}`));
            });
        }
        if (processedScript.validation.warnings.length > 0) {
            console.log(chalk_1.default.yellow('\nWarnings:'));
            processedScript.validation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
        }
        // Fail if validation failed and not overridden
        if (!processedScript.validation.isValid && options.validate !== false) {
            console.error(chalk_1.default.red('\n❌ Cannot update command due to validation errors.'));
            console.log(chalk_1.default.gray('Use --no-validate to skip validation (not recommended).'));
            return;
        }
        // Display script processing info
        console.log(chalk_1.default.blue(`\n🔍 Script Analysis:`));
        console.log(chalk_1.default.gray(`   Original Platform: ${processedScript.originalPlatform}`));
        console.log(chalk_1.default.gray(`   Script Type: ${processedScript.scriptType}`));
        console.log(chalk_1.default.gray(`   Windows Version: ${processedScript.windows ? '✅ Generated' : '❌ Not available'}`));
        console.log(chalk_1.default.gray(`   Unix Version: ${processedScript.unix ? '✅ Generated' : '❌ Not available'}`));
        console.log(chalk_1.default.gray(`   Cross-Platform: ${processedScript.crossPlatform ? '✅ Generated' : '❌ Not available'}`));
        // Prepare updates with new multi-script fields
        const updates = {
            script_original: processedScript.original,
            script_windows: processedScript.windows,
            script_unix: processedScript.unix,
            script_cross_platform: processedScript.crossPlatform,
            original_platform: processedScript.originalPlatform,
            script_type: processedScript.scriptType
        };
        if (options.platform !== undefined)
            updates.platform = options.platform;
        const success = await db.updateCommand(type, name, updates);
        if (success) {
            console.log(chalk_1.default.green(`\n✅ Updated ${type} command "${name}"`));
            // Show platform compatibility info for updated command
            const updatedCommand = { ...existing, ...updates };
            const compatibility = processor.validatePlatformCompatibility(updatedCommand, process.platform);
            if (!compatibility.compatible || compatibility.warnings.length > 0) {
                console.log(chalk_1.default.yellow('\n⚠️  Platform Compatibility:'));
                compatibility.warnings.forEach(warning => {
                    console.log(chalk_1.default.yellow(`   • ${warning}`));
                });
                if (compatibility.recommendations.length > 0) {
                    console.log(chalk_1.default.blue('\n💡 Recommendations:'));
                    compatibility.recommendations.forEach(rec => {
                        console.log(chalk_1.default.blue(`   • ${rec}`));
                    });
                }
            }
        }
        else {
            console.error(chalk_1.default.red('❌ Failed to update command.'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to update command: ${error.message}`));
        throw error;
    }
}
// Remove command
async function removeCommand(type, name) {
    const success = await db.removeCommand(type, name);
    if (success) {
        console.log(chalk_1.default.green(`✅ Removed ${type} command "${name}"`));
    }
    else {
        console.error(chalk_1.default.red(`${type} command "${name}" not found.`));
    }
}
// List commands
async function listCommands(type, detailed = false) {
    const commands = await db.listCommands(type);
    if (commands.length === 0) {
        console.log(chalk_1.default.gray('No commands available.'));
        return;
    }
    console.log(chalk_1.default.blue(`\\n📋 Available Commands${type ? ` (${type})` : ''}:`));
    const groupedCommands = commands.reduce((acc, cmd) => {
        if (!acc[cmd.type])
            acc[cmd.type] = [];
        acc[cmd.type].push(cmd);
        return acc;
    }, {});
    Object.entries(groupedCommands).forEach(([cmdType, cmds]) => {
        console.log(chalk_1.default.yellow(`\\n${cmdType.toUpperCase()}:`));
        cmds.forEach(cmd => {
            const alias = cmd.alias ? chalk_1.default.gray(` (${cmd.alias})`) : '';
            const platform = cmd.platform !== 'all' ? chalk_1.default.gray(` [${cmd.platform}]`) : '';
            if (detailed) {
                console.log(chalk_1.default.cyan(`  • ${cmd.name}${alias}${platform}`));
                if (cmd.description) {
                    console.log(chalk_1.default.gray(`    ${cmd.description}`));
                }
                console.log(chalk_1.default.gray(`    Updated: ${new Date(cmd.updatedAt).toLocaleDateString()}`));
            }
            else {
                console.log(chalk_1.default.cyan(`  • ${cmd.name}${alias}${platform}`));
            }
        });
    });
}
// Display command details - Production Ready Version
function displayCommandDetails(command) {
    console.log(chalk_1.default.blue(`\\n📄 Command Details: ${command.name}`));
    console.log(chalk_1.default.gray('═'.repeat(60)));
    // Basic info
    console.log(chalk_1.default.yellow('Type:'), chalk_1.default.cyan(command.type));
    console.log(chalk_1.default.yellow('Name:'), chalk_1.default.cyan(command.name));
    if (command.alias) {
        console.log(chalk_1.default.yellow('Alias:'), chalk_1.default.cyan(command.alias));
    }
    if (command.description) {
        console.log(chalk_1.default.yellow('Description:'), command.description);
    }
    console.log(chalk_1.default.yellow('Platform Support:'), chalk_1.default.cyan(command.platform));
    console.log(chalk_1.default.yellow('Created:'), new Date(command.createdAt).toLocaleString());
    console.log(chalk_1.default.yellow('Updated:'), new Date(command.updatedAt).toLocaleString());
    // Script metadata
    if (command.script_type) {
        console.log('\\n' + chalk_1.default.blue('📋 Script Information:'));
        console.log(chalk_1.default.gray('─'.repeat(40)));
        console.log(chalk_1.default.yellow('Original Platform:'), chalk_1.default.cyan(command.original_platform));
        console.log(chalk_1.default.yellow('Script Type:'), chalk_1.default.cyan(command.script_type));
    }
    // Get version info using processor
    const versionInfo = processor.getScriptVersionInfo(command);
    console.log('\\n' + chalk_1.default.blue('📜 Script Versions:'));
    console.log(chalk_1.default.gray('─'.repeat(40)));
    // Original script
    console.log(chalk_1.default.yellow(`\\n🔸 Original (${versionInfo.original.platform}, ${versionInfo.original.type}):`));
    console.log(chalk_1.default.gray(versionInfo.original.content.split('\\n').slice(0, 5).join('\\n') +
        (versionInfo.original.content.split('\\n').length > 5 ? '\\n...' : '')));
    // Windows version
    if (versionInfo.windows?.available) {
        console.log(chalk_1.default.yellow('\\n🔸 Windows Version:'));
        console.log(chalk_1.default.gray(versionInfo.windows.content.split('\\n').slice(0, 3).join('\\n') + '...'));
    }
    // Unix version
    if (versionInfo.unix?.available) {
        console.log(chalk_1.default.yellow('\\n🔸 Unix Version:'));
        console.log(chalk_1.default.gray(versionInfo.unix.content.split('\\n').slice(0, 3).join('\\n') + '...'));
    }
    // Cross-platform version
    if (versionInfo.crossPlatform?.available) {
        console.log(chalk_1.default.yellow('\\n🔸 Cross-Platform Version:'));
        console.log(chalk_1.default.gray(versionInfo.crossPlatform.content.split('\\n').slice(0, 3).join('\\n') + '...'));
    }
    // Best version for current platform
    console.log('\\n' + chalk_1.default.blue(`🎯 Best for Current Platform (${versionInfo.bestForCurrent.version}):`));
    console.log(chalk_1.default.gray('─'.repeat(40)));
    console.log(versionInfo.bestForCurrent.content);
    // Platform compatibility
    const compatibility = processor.validatePlatformCompatibility(command, process.platform);
    if (!compatibility.compatible || compatibility.warnings.length > 0) {
        console.log('\\n' + chalk_1.default.yellow('⚠️  Platform Compatibility:'));
        console.log(chalk_1.default.gray('─'.repeat(40)));
        compatibility.warnings.forEach(warning => {
            console.log(chalk_1.default.yellow(`• ${warning}`));
        });
        if (compatibility.recommendations.length > 0) {
            console.log('\\n' + chalk_1.default.blue('💡 Recommendations:'));
            compatibility.recommendations.forEach(rec => {
                console.log(chalk_1.default.blue(`• ${rec}`));
            });
        }
    }
    else {
        console.log('\\n' + chalk_1.default.green('✅ Fully compatible with current platform'));
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
//# sourceMappingURL=index.js.map