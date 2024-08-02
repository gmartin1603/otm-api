const { MongoClient } = require('mongodb');

let connection;

// const connectionString = "mongodb://localhost:27017/OTM-Backup-Staging";
const connectionString = "mongodb://127.0.0.1:27017/OTM-Backup-Staging";
// const connectionString = "mongodb://127.0.0.1:27017/OTM-Backup";

module.exports = {
    connectToMongoDB: (cb) => {
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
    },
    getConnection: () => connection
}