// generateApiKey.js

import { nanoid } from 'nanoid';
import { initDb } from '../db/mongoClient.js';
import { hashString } from '../helpers/cryptoUtils.js';
import path from 'path'
import { Temporal } from "@js-temporal/polyfill";
import { API_KEYS_COLLECTION } from '../repositories/apiKeysRepository.js';
import fs from 'fs'
(async () => {
    try {
        let db =await initDb();
        let api_key = `api_key_` + nanoid(48);
        let hashed_key = hashString(api_key); //crypto is faster and because its already a complicated string no need to use bcrypt
        let createdAt = new Date();

        await db.collection(API_KEYS_COLLECTION).insertOne({
            _id: hashed_key,
            active: true,
            createdAt,
            revokedAt: null,
            createdBy: "generateApiKey.js",
            owner : "HOLA" //user has to modify this 
        });
        const plain = Temporal.Now.plainDateTimeISO(); 
        const timestamp = `${plain.year}-${String(plain.month).padStart(2, "0")}-${String(plain.day).padStart(2, "0")}_${String(plain.hour).padStart(2, "0")}-${String(plain.minute).padStart(2, "0")}-${String(plain.second).padStart(2, "0")}`;

        const filePath = path.join(process.cwd(), `api_key_${timestamp}.txt`);
        fs.writeFileSync(filePath, api_key, { mode: 0o600 });
        console.log("✅ API key generated and stored.");
        console.log("🔑 Plaintext key written to:", filePath);
        console.log("⚠️ Keep this key safe; it will not be shown again!");

    } catch (error) {
        console.error('Error ocurred when generating new api key, error: ', error)
    }
})();


