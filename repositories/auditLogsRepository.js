import * as mongoClient from '../db/mongoClient.js';

export const AUDIT_LOGS_COLLECTION = "auditLogs";

export const LOG_LEVELS = {
  info: "info",
  warning: "warning",
  error: "error",
  critical: "critical"
};

export const LOG_CATEGORIES = {
  apiKey: "apiKey",
  refreshToken: "refreshToken",
  user: "user"
};

export const LOG_EVENTS = {
  deactivatedKeyUse: "deactivatedKeyUse",
  invalidApiKey: "invalidApiKey",
  loginFailed: "loginFailed",
  loginSuccess: "loginSuccess",
  refreshTokenRevoked: "refreshTokenRevoked"
};

export async function insertLog(doc) {
  return mongoClient.insertOne(AUDIT_LOGS_COLLECTION, {
    timestamp: new Date().toISOString(),
    ...doc
  });
}
