import chalk from 'chalk';
import { sym } from './symbols.js';

export class UsageHelper {
  
  /**
   * Display comprehensive help for the scaffold CLI
   */
  static displayMainHelp(): void {
    console.log(chalk.blue(`\n${sym.rocket()} Scaffold Scripts CLI - Usage Guide`));
    console.log(chalk.blue('='.repeat(50)));
    
    console.log(chalk.yellow('\nQuick Start:'));
    console.log(chalk.cyan('  scripts                     ') + chalk.gray('# Interactive mode - browse and run scripts'));
    console.log(chalk.cyan('  scripts add my-script file  ') + chalk.gray('# Add a script to your library'));
    console.log(chalk.cyan('  scripts my-script           ') + chalk.gray('# Run your script from anywhere'));
    console.log(chalk.cyan('  scripts list                ') + chalk.gray('# List all available scripts'));
    
    console.log(chalk.yellow('\nCommands:'));
    this.displayCommandUsage();
    
    console.log(chalk.yellow('\nExamples:'));
    this.displayExamples();
    
    console.log(chalk.yellow('\nNeed more help?'));
    console.log(chalk.gray('  • Use --help with any command: ') + chalk.cyan('scripts add --help'));
    console.log(chalk.gray('  • Visit: ') + chalk.blue('https://github.com/ChrisColeTech/scaffold-scripts'));
  }
  
  /**
   * Display usage for all commands and their aliases
   */
  static displayCommandUsage(): void {
    const commands = [
      {
        name: 'add',
        aliases: ['a'],
        description: 'Add a script to your library',
        usage: 'scripts add <name> <script-path>',
        options: [
          '-p, --platform <platform>  Target platform: all, windows, or unix (default: all)',
          '--strict                   Use strict validation',
          '--no-validate             Skip validation (use with caution)'
        ],
        examples: [
          'scripts add my-setup setup.sh',
          'scripts a deploy deploy.py --platform unix'
        ]
      },
      {
        name: 'list',
        aliases: ['l'],
        description: 'List all available scripts',
        usage: 'scripts list',
        options: [
          '-d, --detailed             Show detailed information'
        ],
        examples: [
          'scripts list',
          'scripts l --detailed'
        ]
      },
      {
        name: 'remove',
        aliases: ['r'],
        description: 'Remove a script from your library',
        usage: 'scripts remove <name>',
        options: [],
        examples: [
          'scripts remove my-script',
          'scripts r old-deployment'
        ]
      },
      {
        name: 'update',
        aliases: ['u'],
        description: 'Update an existing script',
        usage: 'scripts update <name> <script-path>',
        options: [
          '-p, --platform <platform>  Update target platform',
          '--strict                   Use strict validation'
        ],
        examples: [
          'scripts update my-script new-version.sh',
          'scripts u deploy deploy-v2.py'
        ]
      },
      {
        name: 'view',
        aliases: ['s'],
        description: 'View script details and all versions',
        usage: 'scripts view <name>',
        options: [],
        examples: [
          'scripts view my-script',
          'scripts s deployment'
        ]
      },
      {
        name: 'export',
        aliases: [],
        description: 'Export all scripts to a directory',
        usage: 'scripts export <directory>',
        options: [],
        examples: [
          'scripts export ./my-scripts',
          'scripts export /backup/scripts'
        ]
      }
    ];
    
    commands.forEach(cmd => {
      const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
      console.log(chalk.cyan(`  ${cmd.name}${aliases}`));
      console.log(chalk.gray(`    ${cmd.description}`));
      console.log(chalk.white(`    Usage: ${cmd.usage}`));
      
      if (cmd.options.length > 0) {
        console.log(chalk.gray('    Options:'));
        cmd.options.forEach(option => {
          console.log(chalk.gray(`      ${option}`));
        });
      }
      console.log('');
    });
  }
  
  /**
   * Display specific command help
   */
  static displayCommandHelp(commandName: string): void {
    const helpMap: Record<string, () => void> = {
      'add': this.displayAddHelp,
      'a': this.displayAddHelp,
      'list': this.displayListHelp,
      'l': this.displayListHelp,
      'remove': this.displayRemoveHelp,
      'r': this.displayRemoveHelp,
      'update': this.displayUpdateHelp,
      'u': this.displayUpdateHelp,
      'view': this.displayViewHelp,
      's': this.displayViewHelp,
      'export': this.displayExportHelp
    };
    
    const helpFunction = helpMap[commandName];
    if (helpFunction) {
      helpFunction.call(this);
    } else {
      this.displayMainHelp();
    }
  }
  
  /**
   * Display examples section
   */
  static displayExamples(): void {
    console.log(chalk.cyan('  # Add a React setup script from ChatGPT'));
    console.log(chalk.white('  scripts add react-setup setup.sh'));
    console.log(chalk.white('  scripts react-setup my-new-app'));
    console.log('');
    
    console.log(chalk.cyan('  # Add a Python deployment script'));
    console.log(chalk.white('  scripts add deploy deploy.py --platform unix'));
    console.log(chalk.white('  scripts deploy staging'));
    console.log('');
    
    console.log(chalk.cyan('  # Interactive mode - browse and select scripts'));
    console.log(chalk.white('  scripts'));
    console.log('');
  }
  
  /**
   * Display error with suggested usage
   */
  static displayError(error: string, suggestion?: string): void {
    console.error(chalk.red(`${sym.cross()} Error: ${error}`));
    
    if (suggestion) {
      console.log(chalk.yellow(`${sym.bulb()} Suggestion: ${suggestion}`));
    }
    
    console.log(chalk.gray(`\nFor help, use: ${chalk.cyan('scripts --help')}`));
  }
  
  /**
   * Display add command help
   */
  static displayAddHelp(): void {
    console.log(chalk.blue(`\n${sym.package()} Add Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts add <name> <script-path> [options]'));
    console.log(chalk.white('  scripts a <name> <script-path> [options]'));
    
    console.log(chalk.yellow('\nArguments:'));
    console.log(chalk.cyan('  name          ') + chalk.gray('Name for your script (used to run it later)'));
    console.log(chalk.cyan('  script-path   ') + chalk.gray('Path to your script file'));
    
    console.log(chalk.yellow('\nOptions:'));
    console.log(chalk.cyan('  -p, --platform <platform>  ') + chalk.gray('Target platform: all, windows, or unix (default: all)'));
    console.log(chalk.cyan('  --strict                   ') + chalk.gray('Use strict validation'));
    console.log(chalk.cyan('  --no-validate             ') + chalk.gray('Skip validation (use with caution)'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts add my-setup setup.sh'));
    console.log(chalk.white('  scripts a deploy deploy.py --platform unix --strict'));
    console.log(chalk.white('  scripts add react-init react-setup.js --no-validate'));
  }
  
  /**
   * Display list command help
   */
  static displayListHelp(): void {
    console.log(chalk.blue(`\n${sym.list()} List Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts list [options]'));
    console.log(chalk.white('  scripts l [options]'));
    
    console.log(chalk.yellow('\nOptions:'));
    console.log(chalk.cyan('  -d, --detailed  ') + chalk.gray('Show detailed information including descriptions and dates'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts list'));
    console.log(chalk.white('  scripts l --detailed'));
  }
  
  /**
   * Display remove command help
   */
  static displayRemoveHelp(): void {
    console.log(chalk.blue(`\n${sym.cross()} Remove Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts remove <name>'));
    console.log(chalk.white('  scripts r <name>'));
    
    console.log(chalk.yellow('\nArguments:'));
    console.log(chalk.cyan('  name  ') + chalk.gray('Name of the script to remove'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts remove my-old-script'));
    console.log(chalk.white('  scripts r deployment-v1'));
  }
  
  /**
   * Display update command help
   */
  static displayUpdateHelp(): void {
    console.log(chalk.blue(`\n${sym.package()} Update Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts update <name> <script-path> [options]'));
    console.log(chalk.white('  scripts u <name> <script-path> [options]'));
    
    console.log(chalk.yellow('\nArguments:'));
    console.log(chalk.cyan('  name          ') + chalk.gray('Name of the existing script to update'));
    console.log(chalk.cyan('  script-path   ') + chalk.gray('Path to the new script file'));
    
    console.log(chalk.yellow('\nOptions:'));
    console.log(chalk.cyan('  -p, --platform <platform>  ') + chalk.gray('Update target platform'));
    console.log(chalk.cyan('  --strict                   ') + chalk.gray('Use strict validation'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts update my-script new-version.sh'));
    console.log(chalk.white('  scripts u deploy deploy-v2.py --platform windows'));
  }
  
  /**
   * Display view command help
   */
  static displayViewHelp(): void {
    console.log(chalk.blue(`\n${sym.page()} View Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts view <name>'));
    console.log(chalk.white('  scripts s <name>'));
    
    console.log(chalk.yellow('\nArguments:'));
    console.log(chalk.cyan('  name  ') + chalk.gray('Name of the script to view'));
    
    console.log(chalk.yellow('\nDescription:'));
    console.log(chalk.gray('Shows detailed information about a script including all platform versions,'));
    console.log(chalk.gray('creation date, description, and platform compatibility.'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts view my-deployment'));
    console.log(chalk.white('  scripts s react-setup'));
  }
  
  /**
   * Display export command help
   */
  static displayExportHelp(): void {
    console.log(chalk.blue(`\n${sym.package()} Export Command Help`));
    console.log(chalk.blue('='.repeat(30)));
    
    console.log(chalk.yellow('\nUsage:'));
    console.log(chalk.white('  scripts export <directory>'));
    
    console.log(chalk.yellow('\nArguments:'));
    console.log(chalk.cyan('  directory  ') + chalk.gray('Directory to export all scripts to'));
    
    console.log(chalk.yellow('\nDescription:'));
    console.log(chalk.gray('Exports all your scripts as individual files with metadata headers.'));
    console.log(chalk.gray('Creates a README.md with usage instructions.'));
    
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.white('  scripts export ./my-scripts'));
    console.log(chalk.white('  scripts export /backup/scaffold-scripts'));
  }
  
  /**
   * Display script not found error with suggestions
   */
  static displayScriptNotFound(scriptName: string, availableScripts: string[]): void {
    console.error(chalk.red(`${sym.cross()} Script "${scriptName}" not found.`));
    
    if (availableScripts.length === 0) {
      console.log(chalk.yellow(`\n${sym.info()} No scripts available yet.`));
      console.log(chalk.gray('Add your first script with: ') + chalk.cyan(`scripts add ${scriptName} /path/to/script`));
    } else {
      console.log(chalk.yellow(`\n${sym.list()} Available scripts:`));
      availableScripts.forEach(script => {
        console.log(chalk.cyan(`  • ${script}`));
      });
      
      // Suggest similar scripts if any
      const similar = this.findSimilarScripts(scriptName, availableScripts);
      if (similar.length > 0) {
        console.log(chalk.yellow(`\n${sym.bulb()} Did you mean:`));
        similar.forEach(script => {
          console.log(chalk.cyan(`  scripts ${script}`));
        });
      }
    }
    
    console.log(chalk.gray(`\nFor interactive mode, just type: ${chalk.cyan('scripts')}`));
  }
  
  /**
   * Find similar script names using basic string similarity
   */
  static findSimilarScripts(target: string, scripts: string[]): string[] {
    return scripts
      .map(script => ({
        script,
        similarity: this.calculateSimilarity(target.toLowerCase(), script.toLowerCase())
      }))
      .filter(item => item.similarity > 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.script);
  }
  
  /**
   * Calculate string similarity (simple implementation)
   */
  static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator   // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}