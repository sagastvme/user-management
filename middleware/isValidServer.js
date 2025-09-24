import { findOne, initDb, updateMany } from "../db/mongoClient";
import { hashString } from "../helpers/cryptoUtils";
import { getIPv4, getUserAgent } from "../helpers/requestUtils";
import { API_KEYS_COLLECTION, deactivateAllApiKeysByOwner, getApiKeyByToken } from "../repositories/apiKeysRepository";
import { insertLog, LOG_CATEGORIES, LOG_EVENTS, LOG_LEVELS } from "../repositories/auditLogsRepository";

export async function isValidServer(req, res, next) {
  try {
    const apiKey = req.get("x-api-key");
    if (!apiKey) {
      return res.status(401).json({ error: "No API key provided" });
    }

    const validKey = await getApiKeyByToken(apiKey);
    if (!validKey) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    if (!validKey.active) {
      if (process.env.API_KEY_STRICT_REVOKE === "true") {
        await deactivateAllApiKeysByOwner(validKey.owner);
      }

      await insertLog({
        level: LOG_LEVELS.warning,
        category: LOG_CATEGORIES.apiKey,
        event: LOG_EVENTS.deactivatedKeyUse,
        actor: { type: "apiKey", id: validKey._id },
        reason: "Attempted to use deactivated API key",
        owner: validKey.owner || "unknown",
        ip: getIPv4(req),
        userAgent: getUserAgent(req)
      });

      return res.status(403).json({ message: "API key deactivated" });
    }

    req.apiKey = validKey; // Pass along to downstream handlers
    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    return res.status(500).json({ error: "Server error during API key validation" });
  }
}