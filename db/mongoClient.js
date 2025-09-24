// db/mongoClient.js
import { MongoClient } from "mongodb";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { MONGO_DB_URI, DATABASE_NAME } = process.env;

if (!MONGO_DB_URI) {
  throw new Error("❌ Missing MONGO_DB_URI in environment variables");
}
if (!DATABASE_NAME) {
  throw new Error("❌ Missing DATABASE_NAME in environment variables");
}

let client;
let db;


export async function initDb() {
  if (db) return db; // reuse cached db

  try {
    client = new MongoClient(MONGO_DB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    db = client.db(DATABASE_NAME);

    console.log(`✅ Connected to MongoDB: ${DATABASE_NAME}`);
    return db;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
    throw error;
  }
}


export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("🔌 MongoDB connection closed");
  }
}

export async function insertOne(collectionName, doc) {
  const db = await initDb();
  return db.collection(collectionName).insertOne(doc);
}

export async function deleteOne(collectionName, doc) {
  const db = await initDb();
  return db.collection(collectionName).deleteOne(doc);
}

export async function deleteMany(collectionName, doc) {
  const db = await initDb();
  return db.collection(collectionName).deleteMany(doc);
}


export async function findOne(collectionName, doc) {
  const db = await initDb();
  return db.collection(collectionName).findOne(doc);
}
export async function findMany(collectionName, doc) {
  const db = await initDb();
  return db.collection(collectionName).findMany(doc);
}


export async function updateMany(collectionName, identifier, updateQuery) {
  const db = await initDb();
  return db.collection(collectionName).updateMany(doc, identifier, updateQuery);
}
