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
    console.log('error inserting user ', error)
    throw error
  }
}


export async function getUserByUsername(username) {
  try {
    return mongoClient.findOne(USER_REPOSITORY_COLLECTION, { _id: username })
  } catch (error) {
    console.log('error getting user by username ', error)
    throw error
  }

}