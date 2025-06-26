// Cross-platform symbol utilities
// Emojis can be problematic on older Windows terminals and some Unix systems

interface SymbolMap {
  [key: string]: {
    emoji: string;
    fallback: string;
  };
}

const symbols: SymbolMap = {
  rocket: { emoji: '🚀', fallback: '>>' },
  package: { emoji: '📦', fallback: '[*]' },
  check: { emoji: '✅', fallback: '[OK]' },
  cross: { emoji: '❌', fallback: '[X]' },
  warning: { emoji: '⚠️', fallback: '[!]' },
  search: { emoji: '🔍', fallback: '...' },
  list: { emoji: '📋', fallback: '[-]' },
  trash: { emoji: '🗑️', fallback: '[DEL]' },
  bulb: { emoji: '💡', fallback: '[?]' },
  book: { emoji: '📖', fallback: '[i]' },
  party: { emoji: '🎉', fallback: '[DONE]' },
  memo: { emoji: '📝', fallback: '[-]' },
  wrench: { emoji: '🔧', fallback: '[CFG]' },
  folder: { emoji: '🗂️', fallback: '[DIR]' },
  page: { emoji: '📄', fallback: '[DOC]' },
  diamond: { emoji: '🔸', fallback: '*' },
  target: { emoji: '🎯', fallback: '=>' },
  info: { emoji: 'ℹ️', fallback: '[i]' }
};

// Detect if terminal supports emojis
function supportsEmojis(): boolean {
  // Windows Command Prompt and older PowerShell versions often have issues
  if (process.platform === 'win32') {
    // Check if we're in Windows Terminal or newer PowerShell
    const term = process.env.WT_SESSION || process.env.TERM_PROGRAM;
    const pwsh = process.env.PSModulePath?.includes('PowerShell/7') || process.env.PSModulePath?.includes('PowerShell\\7');
    
    if (term || pwsh) {
      return true; // Windows Terminal or PowerShell 7+ likely supports emojis
    }
    
    // Legacy cmd.exe or older PowerShell
    return false;
  }
  
  // Unix-like systems - check TERM environment
  const term = process.env.TERM;
  if (!term) return false;
  
  // Most modern terminals support emojis
  if (term.includes('xterm') || term.includes('screen') || term.includes('tmux')) {
    return true;
  }
  
  // Conservative fallback for unknown terminals
  return false;
}

// Get symbol based on platform capability
export function getSymbol(name: keyof typeof symbols): string {
  const symbol = symbols[name];
  if (!symbol) return '';
  
  return supportsEmojis() ? symbol.emoji : symbol.fallback;
}

// Convenience functions for common symbols
export const sym = {
  rocket: () => getSymbol('rocket'),
  package: () => getSymbol('package'),
  check: () => getSymbol('check'),
  cross: () => getSymbol('cross'),
  warning: () => getSymbol('warning'),
  search: () => getSymbol('search'),
  list: () => getSymbol('list'),
  trash: () => getSymbol('trash'),
  bulb: () => getSymbol('bulb'),
  book: () => getSymbol('book'),
  party: () => getSymbol('party'),
  memo: () => getSymbol('memo'),
  wrench: () => getSymbol('wrench'),
  folder: () => getSymbol('folder'),
  page: () => getSymbol('page'),
  diamond: () => getSymbol('diamond'),
  target: () => getSymbol('target'),
  info: () => getSymbol('info')
};