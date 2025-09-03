import * as UAParser from 'ua-parser-js';
export function getIPv4(req) {
  const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  return ip.replace(/^::ffff:/, '');
}
export function getUserAgent(req) {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser.UAParser(userAgent);
    const parsed = parser.getResult();
    let userAgentDetails = { 'browser': parsed.browser, 'os': parsed.os, 'device': parsed.device };
    return userAgentDetails;
}

