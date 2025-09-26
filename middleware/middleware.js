import { findOne, initDb, updateMany } from "../db/mongoClient";
import { hashString } from "../helpers/cryptoUtils";
import { getIPv4, getUserAgent } from "../helpers/requestUtils";
import { API_KEYS_COLLECTION, deactivateAllApiKeysByOwner, getApiKeyByToken } from "../repositories/apiKeysRepository";
import { insertLog, LOG_CATEGORIES, LOG_EVENTS, LOG_LEVELS } from "../repositories/auditLogsRepository";


// middleware/middleware.js
export function requiredFields(params = []) {
  return function (req, res, next) {
    let source;

    // Auto-detect where to check
    const method = req.method.toLowerCase();
    if (["post", "put", "patch"].includes(method)) {
      source = req.body;
    } else if (method === "get" || method === "delete") {
      source = req.query;
    } else {
      source = req.body || req.query; // fallback
    }

    if (!source) {
      return res.status(400).json({ error: "Request data missing" });
    }

    const missing = params.filter((param) => !(param in source));

    if (missing.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    next();
  };
}

export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((e) => {
      console.error("Error executing fn:", fn.name, ", error:", e);
      next(e); // Pass error to Express error handler
    });
  };
}





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