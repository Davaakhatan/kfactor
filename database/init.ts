/**
 * Database Initialization Script
 * Creates database and runs migrations
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database('xfactor.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read schema file
const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

console.log('Initializing database...');

// Execute schema
db.exec(schema);

console.log('✓ Database initialized successfully!');
console.log('  Database file: xfactor.db');

db.close();

