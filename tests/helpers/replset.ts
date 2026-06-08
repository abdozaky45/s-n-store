import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replset: MongoMemoryReplSet | undefined;

/**
 * Connect to an in-memory MongoDB **replica set**. Required for code that uses
 * multi-document transactions (session.startTransaction), which a standalone
 * mongod does not support.
 */
export const connectTestReplSet = async (): Promise<void> => {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replset.getUri());
};

export const closeTestReplSet = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (replset) await replset.stop();
};
