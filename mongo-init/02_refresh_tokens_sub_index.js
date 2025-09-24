// Runs automatically at container init (first DB creation)
// Sets up an index to find refreshtokens by userid

import { REFRESH_TOKENS_COLLECTION } from "../repositories/refreshTokenRepository";

const dbName = process.env.DATABASE_NAME;

const db = db.getSiblingDB(dbName);

// Ensure REFRESH_TOKENS_COLLECTIONSection exists
db.createCollection(REFRESH_TOKENS_COLLECTION);

db[REFRESH_TOKENS_COLLECTION].createIndex(
  { sub: 1 },
  {
    name: 'index_for_user_id'
  }
);
