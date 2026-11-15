const mongoose = require("mongoose");
const tool = require("./tool");
const { getEnv } = require("./env");

// Database connection
mongoose.Promise = global.Promise;

const options = {
  autoIndex: false,
  poolSize: 10,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000
};

const connectionString = getEnv('MONGODB_URI');
let connectionPromise = null;

const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(connectionString, options)
      .then(() => {
        console.log('\x1b[32m', "Connected successfully to MongoDatabase");
        tool.createadmin();
        return mongoose;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error("Error connecting to Mongo Database", err);
        throw err;
      });
  }

  return connectionPromise;
};

mongoose.ensureConnection = connectDatabase;
connectDatabase().catch(() => {});

module.exports = mongoose;
