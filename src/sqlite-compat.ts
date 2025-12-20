/**
 * Runtime-aware SQLite compatibility layer.
 * Uses bun:sqlite in Bun runtime, better-sqlite3 in Node.js.
 */

// Minimal interface matching what we use from better-sqlite3
export interface Statement {
	all(...params: unknown[]): unknown[];
}

export interface Database {
	prepare(sql: string): Statement;
	close(): void;
}

// Check if running in Bun
const isBun = typeof globalThis.Bun !== "undefined";

let DatabaseClass: new (filename: string) => Database;

if (isBun) {
	// Bun runtime - use built-in bun:sqlite
	// biome-ignore lint/style/noVar: dynamic import needs var for hoisting
	var { Database: BunDatabase } = await import("bun:sqlite");
	DatabaseClass = BunDatabase as unknown as new (filename: string) => Database;
} else {
	// Node.js - use better-sqlite3
	// biome-ignore lint/style/noVar: dynamic import needs var for hoisting
	var BetterSqlite3 = (await import("better-sqlite3")).default;
	DatabaseClass = BetterSqlite3 as unknown as new (filename: string) => Database;
}

export { DatabaseClass as Database };
