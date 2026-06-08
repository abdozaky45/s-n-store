import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer | undefined;

/** Spin up an in-memory MongoDB and connect mongoose to it. */
export const connectTestDB = async (): Promise<void> => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};

/** Wipe every collection between tests so each test starts clean. */
export const clearTestDB = async (): Promise<void> => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

/** Tear down the connection and stop the in-memory server. */
export const closeTestDB = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
};
