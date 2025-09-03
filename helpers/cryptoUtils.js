import * as crypto from "crypto";
import * as bcrypt from "bcrypt"

const pw_pepper = process.env.PW_PEPPER

export function hashRefreshToken(refreshToken) {
  return crypto.createHash('sha256').update(refreshToken + pw_pepper).digest('hex')
}


export async function hashString(password) {
  return bcrypt.hash(password + pw_pepper, 10)
}

export async function validPassword(password, passwordHashed) {
  return await bcrypt.compare(password + pw_pepper, passwordHashed);
}