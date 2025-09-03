// Runs automatically at container init (first DB creation)
// Sets up a TTL index so tokens expire 7h after insertion

const dbName = process.env.DATABASE_NAME;
const collection = 'refreshTokens';

const db = db.getSiblingDB(dbName);

db.createCollection(collection);

// Create TTL index: expire 7 hours (25200 seconds) after createdAt
db[collection].createIndex(
  { createdAt: 1 },
  {
    expireAfterSeconds: 25200, // 7 * 60 * 60
    name: 'ttl_createdAt_7h'
  }
);
