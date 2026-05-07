/**
 * Promote User to Admin Script
 * Run with: npx tsx scripts/promote-admin.ts <email>
 * Example: npx tsx scripts/promote-admin.ts user@example.com
 */

// Load environment variables from .env
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { connectDB } from '../src/lib/db';
import User from '../src/models/User';

async function promoteToAdmin(email: string) {
  console.log('🔄 Connecting to MongoDB...\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Find user by email
    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\nℹ️  Available users:');
      const allUsers = await User.find().select('name email role').lean();
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      process.exit(1);
    }

    // Check current role
    if (user.role === 'admin') {
      console.log(`ℹ️  User ${user.name} is already an admin!`);
      process.exit(0);
    }

    // Promote to admin
    console.log(`\n📝 Current role: ${user.role}`);
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully promoted ${user.name} to admin!`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👑 New role: ${user.role}`);
    console.log('\n⚠️  Note: User needs to sign out and sign in again for changes to take effect.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user:');
    console.error(error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: npx tsx scripts/promote-admin.ts <email>');
  console.log('Example: npx tsx scripts/promote-admin.ts user@example.com');
  process.exit(1);
}

promoteToAdmin(email);
