export interface ScaffoldCommand {
    id?: number;
    type: 'frontend' | 'backend' | 'init';
    name: string;
    script_original: string;
    script_windows?: string;
    script_unix?: string;
    script_cross_platform?: string;
    original_platform: 'windows' | 'unix' | 'cross-platform';
    script_type: 'shell' | 'powershell' | 'python' | 'nodejs' | 'batch' | 'mixed';
    platform: 'all' | 'windows' | 'unix';
    alias?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class ScaffoldDatabase {
    private db;
    private initPromise;
    constructor();
    private initDatabase;
    private createNewSchema;
    private migrateDatabase;
    private seedDefaultCommands;
    addCommand(command: Omit<ScaffoldCommand, 'id'>): Promise<void>;
    updateCommand(type: string, name: string, updates: Partial<ScaffoldCommand>): Promise<boolean>;
    removeCommand(type: string, name: string): Promise<boolean>;
    getCommand(type: string, name: string): Promise<ScaffoldCommand | null>;
    getCommandByAlias(alias: string): Promise<ScaffoldCommand | null>;
    listCommands(type?: string): Promise<ScaffoldCommand[]>;
    getInitCommand(name?: string): Promise<ScaffoldCommand | null>;
    hasInitCommand(name?: string): Promise<boolean>;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map