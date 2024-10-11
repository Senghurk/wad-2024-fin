import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((mongoose) => {
        console.log("DB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("DB connection error:", error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Error while awaiting DB connection:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
