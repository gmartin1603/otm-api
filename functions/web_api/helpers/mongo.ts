import { MongoClient } from 'mongodb';

let connection: any;

// const connectionString = "mongodb://localhost:27017/OTM-Backup-Staging";
// const connectionString = "mongodb://127.0.0.1:27017/OTM-Backup-Staging";
const connectionString = "mongodb://127.0.0.1:27017/OTM-Backup";

export const connectToMongoDB = (cb: (error?: any) => void) => {
  console.log("Connecting to MongoDB");
  MongoClient.connect(connectionString)
  .then((client) => {
    connection = client.db();
    console.log('Connected to MongoDB');
    return cb()
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    return cb(error)
  });
};

export const getConnection = () => connection;