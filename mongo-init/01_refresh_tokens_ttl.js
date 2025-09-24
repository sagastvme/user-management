// Runs automatically at container init (first DB creation)
// Sets up a TTL index so tokens expire 7h after insertion

import { REFRESH_TOKENS_COLLECTION } from "../repositories/refreshTokenRepository";

const dbName = process.env.DATABASE_NAME;

const db = db.getSiblingDB(dbName);

db.createCollection(REFRESH_TOKENS_COLLECTION);

// Create TTL index: expire 7 hours (25200 seconds) after createdAt
db[collection].createIndex(
  { createdAt: 1 },
  {
    expireAfterSeconds: 25200, // 7 * 60 * 60
    name: 'ttl_createdAt_7h'
  }
);
