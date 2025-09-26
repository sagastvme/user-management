import * as mongoClient from '../db/mongoClient.js'
export const USER_REPOSITORY_COLLECTION = 'users'


export async function insertUser(username, password, sub) {
 try {
     const userDoc = {
       _id: username,
       password,
       sub
     };
     return mongoClient.insertOne(USER_REPOSITORY_COLLECTION, userDoc)
 } catch (error) {
        const isDup = err.code === 11000;
        const DUPLICATE_MSG = 'Username is already taken';

        console.error(isDup ? DUPLICATE_MSG : 'Error creating new user:', err);

        return res.status(isDup ? 409 : 400).json({
            error: isDup ? DUPLICATE_MSG : err.message
        });
    }
 }


export async function getUserByUsername(username) {
    return mongoClient.findOne(USER_REPOSITORY_COLLECTION, { _id: username })
}