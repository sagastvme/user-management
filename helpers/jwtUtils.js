import * as crypto from "crypto";
import jwt from 'jsonwebtoken'; // ✅ Importa el módulo entero

const { sign, verify } = jwt;    // ✅ Extrae las funciones manualmente

import { deleteAllHashesBySub, insertHash } from "../repositories/refreshTokenRepository.js";
import { hashRefreshToken } from "./cryptoUtils.js";
import * as fs from 'fs'
import { nanoid } from "nanoid";
const JWT_TTL = 10 //minutes 

const REFRESH_TTL = 7 //hours 

const privateKey = fs.readFileSync('./private.pem')



export async function generateJwtAndRefreshToken(sub, ip, userAgent) {

    const header = {
        alg: 'RS256',
        typ: 'JWT',
    }

    const payload = {
        sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * JWT_TTL, // 10 minutes
    }

    const token = sign(payload, privateKey, {
        algorithm: 'RS256',
        header, // lo pasas como objeto directamente
    })

    const rawRefresh = crypto.randomBytes(32).toString('hex') // este se devuelve al usuario
    const hashedRefresh = hashRefreshToken(rawRefresh)

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
