/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, sql.js (WASM) in Node.js.
 */
import fs from "node:fs";
import type { BindParams } from "sql.js";

// Minimal interface matching what we use
export interface Statement {
	all(...params: unknown[]): unknown[];
}

export interface DatabaseInterface {
	prepare(sql: string): Statement;
	close(): void;
}

// Check if running in Bun
const isBun = "bun" in process.versions;

type DatabaseConstructor = new (filename: string) => DatabaseInterface;

let DatabaseClass: DatabaseConstructor;

if (isBun) {
	// Bun runtime - use built-in bun:sqlite
	// @ts-expect-error - bun:sqlite is a Bun-specific module
	const { Database: BunDatabase } = await import("bun:sqlite");
	DatabaseClass = BunDatabase as DatabaseConstructor;
} else {
	// Node.js - use sql.js (pure JavaScript/WASM SQLite)
	const initSqlJs = (await import("sql.js")).default;
	const SQL = await initSqlJs();

	class SqlJsWrapper implements DatabaseInterface {
		private db: InstanceType<typeof SQL.Database>;

		constructor(filename: string) {
			const buffer = fs.readFileSync(filename);
			this.db = new SQL.Database(buffer);
		}

		prepare(sql: string): Statement {
			const db = this.db;
			return {
				all(...params: unknown[]): unknown[] {
					const stmt = db.prepare(sql);
					if (params.length > 0) {
						stmt.bind(params as BindParams);
					}
					const results: unknown[] = [];
					while (stmt.step()) {
						results.push(stmt.getAsObject());
					}
					stmt.free();
					return results;
				},
			};
		}

		close(): void {
			this.db.close();
		}
	}

	DatabaseClass = SqlJsWrapper as unknown as DatabaseConstructor;
}

export { DatabaseClass as Database };
