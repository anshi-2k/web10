const { MongoClient } = require('mongodb');
const url = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const db = client.db("kidsDB");
    const result = await db.collection("kids_users").find({}).toArray();
    
    console.log("\n--- REGISTERED KIDS DATA IN MONGODB ---");
    console.log(result);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await client.close();
  }
}

run();