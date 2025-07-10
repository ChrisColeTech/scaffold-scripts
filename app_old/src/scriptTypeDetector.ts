export interface ScriptTypeInfo {
  type: 'shell' | 'python' | 'nodejs' | 'powershell' | 'batch' | 'mixed';
  interpreters: string[];
  extensions: string[];
  shebang?: string;
}

export class ScriptTypeDetector {
  
  /**
   * Detect script type from content
   */
  detectType(script: string): ScriptTypeInfo {
    const lines = script.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      return { type: 'shell', interpreters: ['bash'], extensions: ['.sh'] };
    }

    // Check shebang
    const firstLine = lines[0];
    if (firstLine.startsWith('#!')) {
      return this.detectFromShebang(firstLine);
    }

    // Analyze content patterns
    return this.detectFromContent(script);
  }

  /**
   * Detect the original platform of the script
   */
  detectPlatform(script: string): 'windows' | 'unix' | 'cross-platform' {
    const windowsPatterns = [
      /New-Item\s+-ItemType/,
      /Get-ChildItem/,
      /Write-Output|Write-Host/,
      /\$env:/,
      /\.ps1\b/,
      /Copy-Item|Move-Item/,
      /@echo\s+off/i,
      /set\s+\w+=/,
      /\.bat\b|\.cmd\b/,
      /rmdir\s+\/s/,
      /\\\\/  // Windows path separators
    ];

    const unixPatterns = [
      /mkdir\s+-p/,
      /ls\s+/,
      /echo\s+/,
      /export\s+\w+=/,
      /\.sh\b/,
      /cp\s+|mv\s+/,
      /rm\s+-rf/,
      /which\s+/,
      /chmod\s+/,
      /\//,  // Unix path separators
      /#!\s*\/.*\/(bash|sh|python|node)/
    ];

    const windowsScore = this.countMatches(script, windowsPatterns);
    const unixScore = this.countMatches(script, unixPatterns);

    // If scores are close, consider it cross-platform
    if (Math.abs(windowsScore - unixScore) <= 1 && windowsScore + unixScore > 0) {
      return 'cross-platform';
    }

    if (windowsScore > unixScore) {
      return 'windows';
    } else if (unixScore > windowsScore) {
      return 'unix';
    } else {
      return 'cross-platform';
    }
  }

  /**
   * Detect from shebang line
   */
  private detectFromShebang(shebang: string): ScriptTypeInfo {
    if (shebang.includes('python')) {
      return {
        type: 'python',
        interpreters: ['python', 'python3'],
        extensions: ['.py'],
        shebang
      };
    }
    
    if (shebang.includes('node')) {
      return {
        type: 'nodejs',
        interpreters: ['node'],
        extensions: ['.js', '.mjs'],
        shebang
      };
    }
    
    if (shebang.includes('bash') || shebang.includes('sh')) {
      return {
        type: 'shell',
        interpreters: ['bash', 'sh'],
        extensions: ['.sh'],
        shebang
      };
    }

    // Default to shell for unknown shebangs
    return {
      type: 'shell',
      interpreters: ['bash'],
      extensions: ['.sh'],
      shebang
    };
  }

  /**
   * Detect from script content patterns
   */
  private detectFromContent(script: string): ScriptTypeInfo {
    const pythonPatterns = [
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /def\s+\w+\(/,
      /if\s+__name__\s*==\s*['""]__main__['""]:/,
      /pip\s+install/,
      /python\s+-m\s+venv/,
      /\.py\b/,
      /input\s*\(/,
      /print\s*\(/,
      /f["'][^"']*\{[^}]*\}/
    ];

    const nodePatterns = [
      /require\s*\(['"]/,
      /module\.exports/,
      /npm\s+(install|run|start)/,
      /yarn\s+(install|run|start)/,
      /package\.json/,
      /node_modules/,
      /\.js\b|\.ts\b|\.mjs\b/
    ];

    const powershellPatterns = [
      /Write-Host/,
      /Write-Output/,
      /Get-\w+/,
      /Set-\w+/,
      /New-\w+/,
      /\$\w+\s*=/,
      /\$env:/,
      /\.ps1\b/,
      /-ForegroundColor/,
      /-ItemType/,
      /ni\s+-ItemType/,
      /New-Item/,
      /Copy-Item/,
      /Move-Item/,
      /Test-Path/,
      /Join-Path/,
      /Split-Path/,
      /Read-Host/,
      /\[string\]::/,
      /\$LASTEXITCODE/,
      /param\s*\(/
    ];

    const batchPatterns = [
      /@echo\s+off/i,
      /\.bat\b|\.cmd\b/,
      /set\s+\w+=/,
      /if\s+exist/i,
      /goto\s+\w+/i
    ];

    // Count matches for each type
    const pythonScore = this.countMatches(script, pythonPatterns);
    const nodeScore = this.countMatches(script, nodePatterns);
    const powershellScore = this.countMatches(script, powershellPatterns);
    const batchScore = this.countMatches(script, batchPatterns);

    // Determine the dominant type (prioritize PowerShell detection)
    const scores = [
      { type: 'powershell' as const, score: powershellScore, info: { interpreters: ['powershell', 'pwsh'], extensions: ['.ps1'] } },
      { type: 'python' as const, score: pythonScore, info: { interpreters: ['python', 'python3'], extensions: ['.py'] } },
      { type: 'nodejs' as const, score: nodeScore, info: { interpreters: ['node'], extensions: ['.js', '.mjs'] } },
      { type: 'batch' as const, score: batchScore, info: { interpreters: ['cmd'], extensions: ['.bat', '.cmd'] } }
    ];

    const maxScore = Math.max(...scores.map(s => s.score));
    
    if (maxScore === 0) {
      // No specific patterns found, default to shell
      return { type: 'shell', interpreters: ['bash'], extensions: ['.sh'] };
    }

    // Check if multiple types have high scores (mixed script)
    const highScorers = scores.filter(s => s.score >= maxScore * 0.7);
    if (highScorers.length > 1) {
      return {
        type: 'mixed',
        interpreters: highScorers.flatMap(s => s.info.interpreters),
        extensions: highScorers.flatMap(s => s.info.extensions)
      };
    }

    const winner = scores.find(s => s.score === maxScore)!;
    return {
      type: winner.type,
      interpreters: winner.info.interpreters,
      extensions: winner.info.extensions
    };
  }

  /**
   * Count pattern matches in script
   */
  private countMatches(script: string, patterns: RegExp[]): number {
    return patterns.reduce((count, pattern) => {
      const matches = script.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  /**
   * Generate appropriate execution command for script type
   */
  getExecutionCommand(scriptType: ScriptTypeInfo, scriptPath: string): string {
    switch (scriptType.type) {
      case 'python':
        // Try python3 first, then python
        return `python3 "${scriptPath}"`;
      case 'nodejs':
        return `node "${scriptPath}"`;
      case 'powershell':
        // Try pwsh first (cross-platform), then fall back to powershell.exe on Windows
        if (process.platform === 'win32') {
          return `pwsh -ExecutionPolicy Bypass -File "${scriptPath}"`;
        } else {
          return `pwsh -File "${scriptPath}"`;
        }
      case 'batch':
        return `"${scriptPath}"`;
      case 'shell':
        return `bash "${scriptPath}"`;
      case 'mixed':
        // For mixed scripts, default to shell execution
        return `bash "${scriptPath}"`;
      default:
        return `bash "${scriptPath}"`;
    }
  }

  /**
   * Check if required interpreters are available
   */
  async checkInterpreterAvailability(scriptType: ScriptTypeInfo): Promise<{
    available: string[];
    missing: string[];
  }> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const available: string[] = [];
    const missing: string[] = [];

    for (const interpreter of scriptType.interpreters) {
      try {
        const command = process.platform === 'win32' ? 
          `where ${interpreter}` : 
          `which ${interpreter}`;
        
        await execAsync(command);
        available.push(interpreter);
      } catch {
        missing.push(interpreter);
      }
    }

    return { available, missing };
  }
}