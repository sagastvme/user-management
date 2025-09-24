import readline from "readline";

import { initDb } from '../db/mongoClient.js';
import { hashString } from "../helpers/cryptoUtils.js";
import { API_KEYS_COLLECTION } from "../repositories/apiKeysRepository.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

(async () => {
    try {
        const apiKey = await question("Enter the api key you want to deactivate: ");
        const hashed = hashString(apiKey)
        let db = await initDb();
        let revokedAt = new Date();
        const result = await db.collection(API_KEYS_COLLECTION).updateOne(
            { _id: hashed, active: true }, // filter
            { $set: { active: false, revokedAt } } // update
        );
        console.log('Your api key has been deactivated')
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('There was an error deactivating your key: ', error)
        process.exit(1);

    }
})();
