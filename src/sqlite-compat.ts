/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, better-sqlite3 in Node.js.
 */

// Minimal interface matching what we use from better-sqlite3
export interface Statement {
	all(...params: unknown[]): unknown[];
}

export interface DatabaseInterface {
	prepare(sql: string): Statement;
	close(): void;
}

// Check if running in Bun - use process.versions which exists in both runtimes
const isBun = "bun" in process.versions;

type DatabaseConstructor = new (filename: string) => DatabaseInterface;

let DatabaseClass: DatabaseConstructor;

if (isBun) {
	// Bun runtime - use built-in bun:sqlite
	// @ts-expect-error - bun:sqlite is a Bun-specific module
	const { Database: BunDatabase } = await import("bun:sqlite");
	DatabaseClass = BunDatabase as DatabaseConstructor;
} else {
	// Node.js - use better-sqlite3
	const BetterSqlite3 = (await import("better-sqlite3")).default;
	DatabaseClass = BetterSqlite3 as unknown as DatabaseConstructor;
}

export { DatabaseClass as Database };
