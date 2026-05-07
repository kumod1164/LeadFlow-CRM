import mongoose from 'mongoose';

// Fix for Node.js DNS resolution issues with MongoDB Atlas
// Force Node.js to use the system DNS resolver instead of c-ares
import dns from 'dns';
dns.setDefaultResultOrder('verbatim');

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Cached connection to prevent multiple connections during hot-reload in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose.
 * Prevents multiple connections during Next.js hot-reload in development.
 * 
 * @returns {Promise<typeof mongoose>} The Mongoose connection instance
 * @throws {Error} If MONGODB_URI environment variable is not defined
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  const existingConn = cached.conn;
  if (existingConn) {
    return existingConn;
  }

  // Validate environment variable
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  // Create new connection promise if not exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Additional options to help with DNS resolution
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    // Await and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  const connection = cached.conn;
  if (!connection) {
    throw new Error('Failed to establish database connection');
  }
  
  return connection;
}
