/**
 * MongoDB Connection Test Script
 * Run with: npx tsx scripts/test-connection.ts
 */

// Load environment variables from .env
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { connectDB } from '../src/lib/db';
import User from '../src/models/User';

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...\n');

  try {
    // Test connection
    const mongoose = await connectDB();
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}\n`);

    // Test User model
    console.log('🔍 Checking User collection...');
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}\n`);

    if (userCount > 0) {
      console.log('📋 Existing users:');
      const users = await User.find().select('name email role createdAt').lean();
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('ℹ️  No users found. Sign in with Google OAuth to create your first user.');
    }

    console.log('\n✨ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
