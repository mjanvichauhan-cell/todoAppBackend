import { MongoClient } from "mongodb";
const url = "mongodb+srv://janvi14657315_db_user:1234567890@cluster0.ejcx5t1.mongodb.net/";
const dbName = "todoAppProject";
export const collectionName = "todoapp";
const client = new MongoClient(url);
let db;
export const connection = async () => {
    if (db) {
        return db;
    }
    await client.connect();
    console.log("MongoDB Connected Successfully");
    db = client.db(dbName);
    return db;
};