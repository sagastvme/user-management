import * as UAParser from "ua-parser-js";

export function getIPv4(req) {
  const forwarded = req.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.ip || req.socket?.remoteAddress || null;

  return ip ? ip.replace(/^::ffff:/, "") : null;
}

export function getUserAgent(req) {
  const userAgentString = req.get("user-agent") || "unknown";
  const parser = new UAParser.UAParser(userAgentString);
  const parsed = parser.getResult();

  return {
    browser: parsed.browser.name || "unknown",
    browserVersion: parsed.browser.version || "unknown",
    os: parsed.os.name || "unknown",
    osVersion: parsed.os.version || "unknown",
    device: parsed.device.model || "unknown"
  };
}
