/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, better-sqlite3 in Node.js.
 */
export interface Statement {
    all(...params: unknown[]): unknown[];
}
export interface DatabaseInterface {
    prepare(sql: string): Statement;
    close(): void;
}
type DatabaseConstructor = new (filename: string) => DatabaseInterface;
declare let DatabaseClass: DatabaseConstructor;
export { DatabaseClass as Database };
