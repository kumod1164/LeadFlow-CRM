import { connectDB } from '../src/lib/db';
import User from '../src/models/User';
import Lead from '../src/models/Lead';
import Notification from '../src/models/Notification';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed script to populate database with realistic demo data
 * Clears existing data and creates:
 * - 4 users (2 admins, 2 sales users)
 * - 30 realistic leads across different stages with embedded notes
 * - 15 notifications
 */

// Test user accounts
const users = [
  {
    name: 'Admin User',
    email: 'admin@leadflow.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    name: 'Sales Manager',
    email: 'manager@leadflow.com',
    password: 'manager123',
    role: 'admin' as const,
  },
  {
    name: 'John Sales',
    email: 'sales1@leadflow.com',
    password: 'sales123',
    role: 'user' as const,
  },
  {
    name: 'Sarah Sales',
    email: 'sales2@leadflow.com',
    password: 'sales123',
    role: 'user' as const,
  },
];

// Realistic company data
const companies = [
  { name: 'TechCorp Solutions', industry: 'Technology', size: 'Enterprise' },
  { name: 'Global Innovations Inc', industry: 'Software', size: 'Mid-Market' },
  { name: 'DataStream Analytics', industry: 'Data Science', size: 'Startup' },
  { name: 'CloudFirst Systems', industry: 'Cloud Services', size: 'Enterprise' },
  { name: 'NextGen Robotics', industry: 'Manufacturing', size: 'Mid-Market' },
  { name: 'FinTech Dynamics', industry: 'Finance', size: 'Startup' },
  { name: 'HealthTech Partners', industry: 'Healthcare', size: 'Enterprise' },
  { name: 'EduLearn Platform', industry: 'Education', size: 'Mid-Market' },
  { name: 'RetailPro Systems', industry: 'Retail', size: 'Enterprise' },
  { name: 'LogiChain Solutions', industry: 'Logistics', size: 'Mid-Market' },
  { name: 'GreenEnergy Corp', industry: 'Energy', size: 'Enterprise' },
  { name: 'MediaStream Plus', industry: 'Media', size: 'Startup' },
  { name: 'SecureNet Technologies', industry: 'Cybersecurity', size: 'Mid-Market' },
  { name: 'AutoDrive Innovations', industry: 'Automotive', size: 'Enterprise' },
  { name: 'FoodTech Ventures', industry: 'Food & Beverage', size: 'Startup' },
  { name: 'PropTech Solutions', industry: 'Real Estate', size: 'Mid-Market' },
  { name: 'TravelEase Systems', industry: 'Travel', size: 'Startup' },
  { name: 'SportsTech Analytics', industry: 'Sports', size: 'Mid-Market' },
  { name: 'AgriTech Innovations', industry: 'Agriculture', size: 'Enterprise' },
  { name: 'FashionForward Tech', industry: 'Fashion', size: 'Startup' },
  { name: 'InsureTech Partners', industry: 'Insurance', size: 'Mid-Market' },
  { name: 'LegalTech Solutions', industry: 'Legal', size: 'Startup' },
  { name: 'ConstructPro Systems', industry: 'Construction', size: 'Enterprise' },
  { name: 'EventTech Platform', industry: 'Events', size: 'Mid-Market' },
  { name: 'PetCare Technologies', industry: 'Pet Care', size: 'Startup' },
  { name: 'BeautyTech Innovations', industry: 'Beauty', size: 'Mid-Market' },
  { name: 'GamingEdge Studios', industry: 'Gaming', size: 'Startup' },
  { name: 'MusicStream Pro', industry: 'Music', size: 'Mid-Market' },
  { name: 'ArtTech Gallery', industry: 'Art', size: 'Startup' },
  { name: 'NonProfit Connect', industry: 'Non-Profit', size: 'Mid-Market' },
];

const stages = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Trade Show', 'Partner'];

// Sample notes for different stages
const noteTemplates = {
  New: [
    'Initial inquiry received via website form',
    'Lead expressed interest in our enterprise solution',
    'Requested product demo for next week',
  ],
  Contacted: [
    'Had initial call - very interested in pricing',
    'Sent follow-up email with case studies',
    'Scheduled demo for next Tuesday at 2 PM',
  ],
  Qualified: [
    'Budget confirmed: $50K-100K range',
    'Decision maker identified: CTO',
    'Timeline: Looking to implement in Q2',
  ],
  Won: [
    'Deal closed! Contract signed',
    'Onboarding scheduled for next month',
    'Customer very excited about implementation',
  ],
  Lost: [
    'Lost to competitor - pricing was main factor',
    'Not ready to move forward - will revisit in 6 months',
    'Went with in-house solution instead',
  ],
};

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`   ✓ Created ${userData.role}: ${userData.email}`);
    }

    // Create leads with embedded notes
    console.log('📊 Creating leads with notes...');
    const createdLeads = [];
    let totalNotes = 0;
    
    for (let i = 0; i < 30; i++) {
      const company = companies[i];
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const assignedUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      // Generate realistic values based on company size
      const valueMultiplier = company.size === 'Enterprise' ? 3 : company.size === 'Mid-Market' ? 2 : 1;
      const baseValue = 20000 + Math.floor(Math.random() * 80000);
      const value = baseValue * valueMultiplier;

      // Generate notes for this lead
      const numNotes = Math.floor(Math.random() * 3) + 1; // 1-3 notes per lead
      const templates = noteTemplates[stage as keyof typeof noteTemplates] || noteTemplates.New;
      const notes = [];
      
      for (let j = 0; j < numNotes; j++) {
        notes.push({
          _id: new mongoose.Types.ObjectId(),
          content: templates[Math.floor(Math.random() * templates.length)],
          authorId: assignedUser._id,
          authorName: assignedUser.name,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
        });
        totalNotes++;
      }

      // Generate timeline entry
      const timeline = [
        {
          action: 'Lead Created',
          userId: assignedUser._id,
          userName: assignedUser.name,
          details: `Lead created from ${sources[Math.floor(Math.random() * sources.length)]}`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        },
      ];

      const lead = await Lead.create({
        name: `${company.name} - ${company.industry} Deal`,
        email: `contact@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        company: company.name,
        stage,
        assignedTo: assignedUser._id,
        notes,
        timeline,
        followUpDate: stage === 'Contacted' || stage === 'Qualified' 
          ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
          : undefined,
      });
      
      createdLeads.push(lead);
      console.log(`   ✓ Created lead: ${lead.name} (${stage}) with ${notes.length} notes`);
    }
    console.log(`✅ Created ${createdLeads.length} leads with ${totalNotes} total notes`);

    // Create notifications
    console.log('🔔 Creating notifications...');
    const notificationTypes = [
      { type: 'assignment' as const, message: 'New lead assigned to you' },
      { type: 'follow_up' as const, message: 'Follow-up reminder for lead' },
      { type: 'assignment' as const, message: 'Lead reassigned to you' },
    ];

    for (let i = 0; i < 15; i++) {
      const notifType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const lead = createdLeads[Math.floor(Math.random() * createdLeads.length)];
      
      await Notification.create({
        userId: user._id,
        type: notifType.type,
        message: `${notifType.message}: ${lead.name}`,
        leadId: lead._id,
        read: Math.random() > 0.5, // 50% read, 50% unread
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
      });
    }
    console.log('✅ Created 15 notifications');

    // Summary
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Leads: ${createdLeads.length}`);
    console.log(`   Notes: ${totalNotes} (embedded in leads)`);
    console.log(`   Notifications: 15`);
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@leadflow.com / admin123');
    console.log('   Manager: manager@leadflow.com / manager123');
    console.log('   Sales 1: sales1@leadflow.com / sales123');
    console.log('   Sales 2: sales2@leadflow.com / sales123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seed();
