import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { jest } from "@jest/globals";

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  let mongoUri;

  if (process.env.MONGO_URI) {
    // GitHub Actions / external MongoDB service
    mongoUri = process.env.MONGO_URI;
  } else {
    // Local development: use the installed MongoDB binary
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14",
        systemBinary:
          "C:\\Users\\ROG\\.cache\\mongodb-binaries\\mongodb-7.0.14\\mongodb-win32-x86_64-windows-7.0.14\\bin\\mongod.exe",
      },
    });

    mongoUri = mongoServer.getUri();
  }

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;

  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});