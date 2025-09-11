import { MongoClient } from "mongodb";
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
