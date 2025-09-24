import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const API_KEYS_COLLECTION = "apiKeys";

export async function insertHash(refreshToken, hashedToken, sub, createdAt, ip, userAgent, deviceId) {
  try {
    await mongoClient.insertOne(API_KEYS_COLLECTION, {
      _id: hashedToken, sub, createdAt, ip, userAgent, deviceId
    })
    console.log("✅ Hashed insertado:", refreshToken);
  } catch (err) {
    console.log('error inserting hash ', err)
    throw err;
  }
}

export async function getHashByRefreshToken(refreshToken) {
  try {
    const hashedToken = hashString(refreshToken)
    return mongoClient.findOne(API_KEYS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error getting hash by refresh token ', error)
    throw error
  }
}

export async function deleteHashByRefreshToken(refreshToken) {
  try {
    const hashedToken = hashString(refreshToken)
    return mongoClient.deleteOne(API_KEYS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error deleting hash by refresh token ', error)
    throw error
  }
}

export async function deleteAllHashesBySub(sub) {
  try {
    return mongoClient.deleteMany(API_KEYS_COLLECTION, { sub })
  } catch (err) {
    console.error('Error deleting previous refresh tokens for user', err);
    throw err;
  }
}
