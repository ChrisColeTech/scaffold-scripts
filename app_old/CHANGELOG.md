# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.24] - 2025-06-30

### Added
- Professional badges to README for build status, NPM stats, and platform support
- Comprehensive contributing guidelines
- GitHub issue and PR templates
- Security policy documentation

### Changed
- Improved README presentation with production-ready status indicators
- Enhanced feature descriptions highlighting real-time output streaming

## [3.0.23] - 2025-06-30

### Added
- **Real-time output streaming** for script execution - see output as commands run!
- Streaming support for all script types (shell, PowerShell, Python, Node.js)

### Fixed
- Fixed "unresponsive" appearance during long-running commands like `npm install`
- Fixed command parsing for interpreter scripts with quoted file paths
- Resolved PowerShell execution errors in streaming mode

### Changed
- Replaced buffered `exec()` with streaming `spawn()` for immediate feedback
- Improved error handling and user experience during script execution

## [3.0.22] - 2025-06-30

### Fixed
- Resolved merge conflicts in interactive input processing
- Fixed cross-platform test compatibility issues
- Updated deprecated GitHub Actions to current versions
- Fixed NPM publish workflow build order

### Changed
- Improved test stability across different platforms
- Enhanced CI/CD pipeline reliability

## [3.0.21] - 2025-06-29

### Added
- Enhanced interactive input detection and automatic fixing
- Multi-language support for interactive script processing
- Advanced PowerShell Read-Host pattern detection

### Fixed
- Hanging prevention for scripts with interactive prompts
- Cross-platform script execution reliability
- Test isolation and environment handling

### Changed
- Improved script processing and validation pipeline
- Enhanced error messages and user feedback

## [3.0.20] - 2025-06-29

### Added
- Comprehensive test coverage for hanging prevention
- Interactive input automatic conversion system
- Script timeout and hanging detection mechanisms

### Fixed
- Scripts hanging on interactive input prompts
- Cross-platform compatibility issues
- Test reliability across different environments

### Security
- Enhanced script validation and safety checks
- Improved handling of potentially problematic script patterns

---

For older versions, please see the [git history](https://github.com/ChrisColeTech/scaffold-scripts/commits/master).