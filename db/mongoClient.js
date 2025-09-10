import { MongoClient } from "mongodb";

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);

let db;

export async function initDb() {
  try {
    if (!db) {
      await client.connect();
      db = client.db(process.env.DATABASE_NAME);
    }
    return db;
  } catch (error) {
    console.log('error connecting to db ', error)
    throw error
  }
}
