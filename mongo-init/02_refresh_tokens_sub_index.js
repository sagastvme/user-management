// Runs automatically at container init (first DB creation)
// Sets up an index to find refreshtokens by userid

const dbName = process.env.DATABASE_NAME;
const coll = 'refreshTokens';

const db = db.getSiblingDB(dbName);

// Ensure collection exists
db.createCollection(coll);

db[coll].createIndex(
  { sub: 1 },
  {
    name: 'index_for_user_id'
  }
);
