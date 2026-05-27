import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

let cached = (
  global as typeof globalThis & {
    mongoose?: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  }
).mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  (global as typeof globalThis & { mongoose?: typeof cached }).mongoose =
    cached;
}

const mongooseCache = cached;

export async function connectToDatabase() {
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}
