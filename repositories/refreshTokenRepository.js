import * as mongoClient from '../db/mongoClient.js'
import { hashString } from '../helpers/cryptoUtils.js';

export const REFRESH_TOKENS_COLLECTION = "refreshTokens";

export async function insertHash(refreshToken, hashedToken, sub, createdAt, ip, userAgent, deviceId) {
    await mongoClient.insertOne(REFRESH_TOKENS_COLLECTION, {
      _id: hashedToken, sub, createdAt, ip, userAgent, deviceId
    })
}

export async function getHashByRefreshToken(refreshToken) {
    const hashedToken = hashString(refreshToken)
    return mongoClient.findOne(REFRESH_TOKENS_COLLECTION, { _id: hashedToken })
}

export async function deleteHashByRefreshToken(refreshToken) {
    const hashedToken = hashString(refreshToken)
    return mongoClient.deleteOne(REFRESH_TOKENS_COLLECTION, { _id: hashedToken })
}

export async function deleteAllHashesBySub(sub) {
    return mongoClient.deleteMany(REFRESH_TOKENS_COLLECTION, { sub })
}

export async function getAllHasheshBySub(sub) {
    return mongoClient.findMany(REFRESH_TOKENS_COLLECTION, { sub })
}


export async function deleteSessionById(refreshTokens) {
    return mongoClient.deleteMany(REFRESH_TOKENS_COLLECTION, {_id: {$in: refreshTokens}})
}