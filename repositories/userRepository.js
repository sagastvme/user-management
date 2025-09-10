import * as mongoClient from '../db/mongoClient.js'
const COLLECTION = 'users'


export async function insertUser(username, password, sub) {
  try {
    const db = await mongoClient.initDb();
    const userDoc = {
      _id: username,
      password,
      sub
    };
    await db.collection(COLLECTION).insertOne(userDoc);
  } catch (error) {
    console.log('error inserting user ', error)
    throw error
  }
}


export async function getUserByUsername(username) {
  try {
    const db = await mongoClient.initDb();
    return await db.collection(COLLECTION).findOne({ _id: username });
  } catch (error) {
    console.log('error getting user by username ', error)
    throw error
  }

}