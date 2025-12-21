/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, better-sqlite3 in Node.js.
 */
// Check if running in Bun - use process.versions which exists in both runtimes
const isBun = "bun" in process.versions;
let DatabaseClass;
if (isBun) {
    // Bun runtime - use built-in bun:sqlite
    // @ts-expect-error - bun:sqlite is a Bun-specific module
    const { Database: BunDatabase } = await import("bun:sqlite");
    DatabaseClass = BunDatabase;
}
else {
    // Node.js - use better-sqlite3
    const BetterSqlite3 = (await import("better-sqlite3")).default;
    DatabaseClass = BetterSqlite3;
}
export { DatabaseClass as Database };
