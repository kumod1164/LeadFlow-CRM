import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';

/**
 * Test database connection endpoint
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test connection
    const mongoose = await connectDB();
    
    // Get collection stats
    const [userCount, leadCount, notificationCount] = await Promise.all([
      User.countDocuments(),
      Lead.countDocuments(),
      Notification.countDocuments(),
    ]);

    // Get sample users
    const users = await User.find()
      .select('name email role createdAt')
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      database: {
        name: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        readyState: mongoose.connection.readyState,
      },
      collections: {
        users: userCount,
        leads: leadCount,
        notifications: notificationCount,
      },
      sampleUsers: users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to database',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
