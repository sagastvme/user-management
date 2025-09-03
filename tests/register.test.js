// tests/register.test.js
import fetch from 'node-fetch'; 
const API_URL = 'http://localhost:3000/register';
import { MongoClient } from 'mongodb';

const USERNAME = 'race_test_user';
const PASSWORD = 'securePassword123!';

describe('Register endpoint race condition test', () => {

  beforeAll(async()=>{
    const uri = "mongodb://root:example@localhost:27017/";
    const client = new MongoClient(uri);
    await client.connect();
    let db = client.db("mydb"); 
    await db.collection('users').deleteOne({_id: USERNAME});
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
