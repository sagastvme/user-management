import { MongoClient } from "mongodb";

const uri = "mongodb://root:example@localhost:27017/";
const client = new MongoClient(uri);

let db;

export async function initDb() {
  if (!db) {
    await client.connect();
    db = client.db("mydb"); // 👈 Cambia por el nombre de tu DB
  }
  return db;
}
