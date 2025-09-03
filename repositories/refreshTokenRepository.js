import * as mongoClient from '../db/mongoClient.js'
import { hashRefreshToken } from '../helpers/cryptoUtils.js';

const COLLECTION = "refreshTokens";

export async function insertHash(refreshToken, hashedToken, sub,  createdAt, ip, userAgent, deviceId) {
    const db = await mongoClient.initDb();
    try {
        await db.collection(COLLECTION).insertOne({
           _id: hashedToken, sub, createdAt,ip,userAgent,deviceId
        }); 
        console.log("✅ Hashed insertado:", refreshToken);
    } catch (err) {
        console.log(err)
        throw err;
    }
}

export async function getHashByRefreshToken(refreshToken) {
    const db = await mongoClient.initDb();
    const hashedToken = hashRefreshToken(refreshToken)
    const doc = await db.collection(COLLECTION).findOne({ _id: hashedToken });
    return doc;
}

export async function deleteHashByRefreshToken(refreshToken) {
    
    const db = await mongoClient.initDb();
    const hashedToken = hashRefreshToken(refreshToken)
    const doc = await db.collection(COLLECTION).deleteOne({ _id: hashedToken });
    return doc
}

export async function deleteAllHashesBySub(sub) {
  try {
    const db = await mongoClient.initDb();
    await db.collection(COLLECTION).deleteMany({ sub });
  } catch (err) {
    console.error('Error deleting previous refresh tokens for user', err);
    throw err;
  }
}

// (async()=>{
//   console.log('hola')
//       const db = await mongoClient.initDb();

//   db.collection(COLLECTION).insertOne({
//   token: "test",
//   createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
// });

// })();