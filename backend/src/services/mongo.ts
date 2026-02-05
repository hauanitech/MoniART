import { MongoClient, Db } from 'mongodb';
import { config } from '../config.js';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(config.mongoUri);
  await client.connect();
  db = client.db();
  console.log('[mongo] Connected to', config.mongoUri);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
