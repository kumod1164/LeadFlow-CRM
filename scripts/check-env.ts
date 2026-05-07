/**
 * Check Environment Variables
 * Run with: npx tsx scripts/check-env.ts
 */

// Load environment variables from .env
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

let allPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    let displayValue = value;
    if (varName.includes('SECRET') || varName.includes('PASSWORD')) {
      displayValue = '***' + value.slice(-4);
    } else if (varName === 'MONGODB_URI') {
      // Show only the cluster name
      const match = value.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
      if (match) {
        displayValue = `mongodb+srv://***:***@${match[3]}`;
      }
    }
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allPresent = false;
  }
});

console.log('\n' + (allPresent ? '✨ All required variables are set!' : '⚠️  Some variables are missing!'));
