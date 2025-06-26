import { ScriptExecutor } from '../src/scriptExecutor';

describe('ScriptExecutor', () => {
  let executor: ScriptExecutor;

  beforeEach(() => {
    executor = new ScriptExecutor();
  });

  describe('convertScript', () => {
    it('should convert Unix commands to Windows', () => {
      const unixScript = 'mkdir -p src/components && touch src/App.js';
      const converted = executor.convertScript(unixScript, 'windows');
      
      expect(converted).toContain('ni -ItemType Directory');
      expect(converted).toContain('ni -ItemType File');
    });

    it('should convert Windows commands to Unix', () => {
      const windowsScript = "ni -ItemType Directory -Force -Path 'src/components'; ni -ItemType File -Force -Path 'src/App.js'";
      const converted = executor.convertScript(windowsScript, 'unix');
      
      expect(converted).toContain('mkdir -p');
      expect(converted).toContain('touch');
    });

    it('should handle mixed commands', () => {
      const script = 'cd frontend && npm install && mkdir -p src/components';
      const converted = executor.convertScript(script, 'windows');
      
      expect(converted).toContain('cd frontend');
      expect(converted).toContain('npm install');
      expect(converted).toContain('ni -ItemType Directory');
    });

    it('should handle Python scripts', () => {
      const pythonScript = 'python -m venv venv && source venv/bin/activate && pip install flask';
      const converted = executor.convertScript(pythonScript, 'windows');
      
      // Should convert Unix venv activation to Windows
      expect(converted).toContain('venv\\\\Scripts\\\\activate');
    });

    it('should preserve npm and dotnet commands', () => {
      const script = 'npm create vite@latest && dotnet new webapi';
      const converted = executor.convertScript(script, 'windows');
      
      expect(converted).toContain('npm create vite@latest');
      expect(converted).toContain('dotnet new webapi');
    });
  });

  describe('previewScript', () => {
    it('should show converted script without executing', () => {
      const script = 'mkdir -p test && echo "Hello"';
      const preview = executor.previewScript(script, 'windows');
      
      expect(preview).toBeTruthy();
      expect(preview).toContain('ni -ItemType Directory');
    });
  });

  // Note: We won't test actual execution in unit tests as it would modify the file system
  // Integration tests would handle that separately
});