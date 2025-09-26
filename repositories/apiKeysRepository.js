import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const API_KEYS_COLLECTION = "apiKeys";



//this method isnt being used yet
export async function insertApiKey(token, hashedToken, owner, createdAt, ip, userAgent, deviceId) {
    await mongoClient.insertOne(API_KEYS_COLLECTION, {
      _id: hashedToken, owner, createdAt, ip, userAgent, deviceId
    })
}

export async function getApiKeyByToken(token) {
    const hashedToken = hashString(token)
    return mongoClient.findOne(API_KEYS_COLLECTION, { _id: hashedToken })
}

export async function deleteApiKeyByToken(token) {
    const hashedToken = hashString(token)
    return mongoClient.deleteOne(API_KEYS_COLLECTION, { _id: hashedToken })
}

export async function deactivateAllApiKeysByOwner(owner) {
    return mongoClient.updateMany(API_KEYS_COLLECTION, { owner }, { $set: { active: false } })
}
