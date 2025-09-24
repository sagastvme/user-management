import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const API_KEYS_COLLECTION = "apiKeys";



//this method isnt being used 
export async function insertApiKey(token, hashedToken, owner, createdAt, ip, userAgent, deviceId) {
  try {
    await mongoClient.insertOne(API_KEYS_COLLECTION, {
      _id: hashedToken, owner, createdAt, ip, userAgent, deviceId
    })
    console.log("✅ Hashed insertado:", token);
  } catch (err) {
    console.log('error inserting hash ', err)
    throw err;
  }
}

export async function getApiKeyByToken(token) {
  try {
    const hashedToken = hashString(token)
    return mongoClient.findOne(API_KEYS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error getting hash by refresh token ', error)
    throw error
  }
}

export async function deleteApiKeyByToken(token) {
  try {
    const hashedToken = hashString(token)
    return mongoClient.deleteOne(API_KEYS_COLLECTION, { _id: hashedToken })
  } catch (error) {
    console.log('error deleting hash by refresh token ', error)
    throw error
  }
}

export async function deactivateAllApiKeysByOwner(owner) {
  try {
    return mongoClient.updateMany(API_KEYS_COLLECTION, { owner }, { $set: { active: false } })
  } catch (err) {
    console.error('Error deleting previous refresh tokens for user', err);
    throw err;
  }
}
