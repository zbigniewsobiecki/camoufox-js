/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, sql.js (WASM) in Node.js.
 */
import fs from "node:fs";
// Check if running in Bun
const isBun = "bun" in process.versions;
let DatabaseClass;
if (isBun) {
    // Bun runtime - use built-in bun:sqlite
    // @ts-expect-error - bun:sqlite is a Bun-specific module
    const { Database: BunDatabase } = await import("bun:sqlite");
    DatabaseClass = BunDatabase;
}
else {
    // Node.js - use sql.js (pure JavaScript/WASM SQLite)
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs();
    class SqlJsWrapper {
        db;
        constructor(filename) {
            const buffer = fs.readFileSync(filename);
            this.db = new SQL.Database(buffer);
        }
        prepare(sql) {
            const db = this.db;
            return {
                all(...params) {
                    const stmt = db.prepare(sql);
                    if (params.length > 0) {
                        stmt.bind(params);
                    }
                    const results = [];
                    while (stmt.step()) {
                        results.push(stmt.getAsObject());
                    }
                    stmt.free();
                    return results;
                },
            };
        }
        close() {
            this.db.close();
        }
    }
    DatabaseClass = SqlJsWrapper;
}
export { DatabaseClass as Database };
