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
