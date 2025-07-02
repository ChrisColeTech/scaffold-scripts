# Legacy Component Migration

## Migration Status
This directory contains migration documentation and temporary compatibility layers.

## Components Migration Progress
- [ ] database.ts → SqliteScriptRepository.ts
- [ ] scriptExecutor.ts → execution/ layer
- [ ] scriptProcessor.ts → processors/ layer
- [ ] scriptValidator.ts → validation/ layer
- [ ] systemCapabilities.ts → SystemService.ts
- [ ] usageHelper.ts → HelpProvider.ts
- [ ] config.ts → AppConfiguration.ts
- [ ] scriptConverter.ts → ConversionProcessor.ts
- [ ] scriptTypeDetector.ts → ProcessorFactory.ts
- [ ] symbols.ts → StringUtils.ts

## Migration Guidelines
1. Preserve all existing functionality
2. Maintain backward compatibility
3. Update tests after each component migration
4. Document any breaking changes

See DETAILED_REFACTOR_PLAN.md for complete migration instructions.
