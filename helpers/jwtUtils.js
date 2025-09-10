import * as crypto from "crypto";
import jwt from 'jsonwebtoken'; 
const { sign } = jwt;   

import { deleteAllHashesBySub, insertHash } from "../repositories/refreshTokenRepository.js";
import { hashString } from "./cryptoUtils.js";
import * as fs from 'fs'
import { nanoid } from "nanoid";


const JWT_TTL = process.env.JWT_TTL 
const privateKeyPath = process.env.PRIVATE_KEY_PATH

const privateKey = fs.readFileSync(privateKeyPath)



export async function generateJwtAndRefreshToken(sub, ip, userAgent) {

    const header = {
        alg: 'RS256',
        typ: 'JWT',
    }

    const payload = {
        sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * JWT_TTL,
    }

    const token = sign(payload, privateKey, {
        algorithm: 'RS256',
        header, 
    })

    const rawRefresh = crypto.randomBytes(32).toString('hex') 
    const hashedRefresh = hashString(rawRefresh)

   const createdAt = new Date();
    // await deleteAllHashesBySub(sub)
    const deviceId = nanoid();
    await insertHash(rawRefresh, hashedRefresh, sub, createdAt, ip, userAgent, deviceId)

    return {
        jwt: token,
        refreshToken: rawRefresh,
        deviceId
    }
}
