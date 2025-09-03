import * as crypto from "crypto";
import * as bcrypt from "bcrypt"

const pw_pepper = 'holaestoayudaanoserhackeado'

export function hashRefreshToken(refreshToken) {
    //   const pepper = process.env.REFRESH_PEPPER ;
    const pepper = pw_pepper
    return crypto.createHash('sha256').update(refreshToken + pepper).digest('hex')
}


export async function hashString(password){
  let hashed =  bcrypt.hash(password + pw_pepper, 10)
  return hashed
}