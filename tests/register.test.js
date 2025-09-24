// tests/register.test.js
import fetch from 'node-fetch'; 
const API_URL = `http://localhost:${process.env.NODE_SERVER_PORT}/register`;
import { MongoClient } from 'mongodb';
import { USER_REPOSITORY_COLLECTION } from '../repositories/userRepository';

const USERNAME = 'race_test_user';
const PASSWORD = 'securePassword123!';

describe('Register endpoint race condition test', () => {

  beforeAll(async()=>{
    const uri = process.env.MONGO_DB_URI
    const client = new MongoClient(uri);
    await client.connect();
    let db = client.db(process.env.DATABASE_NAME); 
    await db.collection(USER_REPOSITORY_COLLECTION).deleteOne({_id: USERNAME});
    await client.close()
    })



  it('should only allow one user creation under race condition', async () => {
    const NUM_REQUESTS = 10;

    const results = await Promise.allSettled(
      Array.from({ length: NUM_REQUESTS }).map((_, i) =>
        fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: USERNAME, password: PASSWORD })
        }).then(async (res) => {
          const data = await res.json();
          return { status: res.status, data };
        })
      )
    );

    const successes = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);
    const conflicts = results.filter(r => r.status === 'fulfilled' && r.value.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(NUM_REQUESTS - 1);

  });
});
