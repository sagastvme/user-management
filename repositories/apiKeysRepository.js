import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const API_KEYS_COLLECTION = "apiKeys";

export async function insertHash(refreshToken, hashedToken, sub, createdAt, ip, userAgent, deviceId) {
  try {
    const db = await mongoClient.initDb();
    await db.collection(API_KEYS_COLLECTION).insertOne({
      _id: hashedToken, sub, createdAt, ip, userAgent, deviceId
    });
    console.log("✅ Hashed insertado:", refreshToken);
  } catch (err) {
    console.log('error inserting hash ', err)
    throw err;
  }
}

export async function getHashByRefreshToken(refreshToken) {
  try {
    const db = await mongoClient.initDb();
    const hashedToken = hashString(refreshToken)
    const doc = await db.collection(API_KEYS_COLLECTION).findOne({ _id: hashedToken });
    return doc;
  } catch (error) {
    console.log('error getting hash by refresh token ', error)
    throw error
  }
}

export async function deleteHashByRefreshToken(refreshToken) {
  try {

    const db = await mongoClient.initDb();
    const hashedToken = hashString(refreshToken)
    const doc = await db.collection(API_KEYS_COLLECTION).deleteOne({ _id: hashedToken });
    return doc
  } catch (error) {
    console.log('error deleting hash by refresh token ', error)
    throw error
  }
}

export async function deleteAllHashesBySub(sub) {
  try {
    const db = await mongoClient.initDb();
    await db.collection(API_KEYS_COLLECTION).deleteMany({ sub });
  } catch (err) {
    console.error('Error deleting previous refresh tokens for user', err);
    throw err;
  }
}
