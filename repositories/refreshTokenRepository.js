import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const REFRESH_TOKENS_COLLECTION = "refreshTokens";

export async function insertHash(refreshToken, hashedToken, sub, createdAt, ip, userAgent, deviceId) {
  try {
    await mongoClient.insertOne(REFRESH_TOKENS_COLLECTION, {
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
    return mongoClient.findOne(REFRESH_TOKENS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error getting hash by refresh token ', error)
    throw error
  }
}

export async function deleteHashByRefreshToken(refreshToken) {
  try {

    const hashedToken = hashString(refreshToken)
    return mongoClient.deleteOne(REFRESH_TOKENS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error deleting hash by refresh token ', error)
    throw error
  }
}

export async function deleteAllHashesBySub(sub) {
  try {
    return mongoClient.deleteMany(REFRESH_TOKENS_COLLECTION, { sub })
  } catch (err) {
    console.error('Error deleting previous refresh tokens for user', err);
    throw err;
  }
}
