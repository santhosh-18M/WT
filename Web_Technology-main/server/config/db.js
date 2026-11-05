const mongoose = require('mongoose');

const connectDB = async () => {
  const configuredUri = process.env.MONGO_URI;

  if (!configuredUri) {
    throw new Error('MONGO_URI is not defined in server/.env');
  }

  await mongoose.connect(configuredUri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log(`MongoDB connected: ${configuredUri}`);
};

module.exports = connectDB;
