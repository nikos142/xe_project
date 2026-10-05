import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { dirname, resolve } from 'node:path';

// ":memory:" is SQLite's in-memory database (used by the tests); anything else is a file path
const IN_MEMORY = ':memory:';
const dbPath =process.env.DB_PATH === IN_MEMORY ? IN_MEMORY : resolve(process.env.DB_PATH ?? 'data/app.db');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS properties (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       VARCHAR(155)        NOT NULL,
    type        VARCHAR(100)        NOT NULL,
    price       DECIMAL(10,2)       NOT NULL, 
    placeId     VARCHAR(255)        NOT NULL,
    area        VARCHAR(255)        NOT NULL,
    floor       INTEGER             NOT NULL, 
    bathrooms   INTEGER             NOT NULL, 
    extra_description TEXT,
    created_at  TEXT                NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT                NOT NULL DEFAULT (datetime('now'))
  );
`);
