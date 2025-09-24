import { initDb } from "../db/mongoClient";
import { hashString } from "../helpers/cryptoUtils";
import { getIPv4, getUserAgent } from "../helpers/requestUtils";
import { API_KEYS_COLLECTION } from "../repositories/apiKeysRepository";



export async function isValidServer(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({ error: 'No API key provided' });
        }

        const hashed = hashString(apiKey);

        const db = await initDb();

        let valid_key = await db.collection(API_KEYS_COLLECTION).findOne({
            _id: hashed,
        })

        if (!valid_key) {
            return res.status(403).json({ error: 'Invalid API key' });
        }

        if (!valid_key.active) {
            //
            // if the api key exists but is active: false because they tried to use it log it 
            // by saving the ip and the date they tried accessing it and the user agent if there is one
            // getUserAgent(req)
            // getIPv4(req)
                //return error
        }

        next();
    } catch (error) {
        console.error("Error validating API key:", error);
        return res.status(500).json({ error: "Server error during API key validation" });

    }
}