import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

/**
 * Promote user to admin endpoint
 * POST /api/promote-admin
 * Body: { email: string }
 * 
 * Note: In production, this should be protected or removed!
 * For development/setup purposes only.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Check if requester is already an admin
    const session = await getServerSession(authOptions);
    
    // For initial setup, allow if no users exist or requester is admin
    await connectDB();
    const userCount = await User.countDocuments();
    const isAdmin = session?.user?.role === 'admin';
    
    if (userCount > 0 && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can promote users.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // List available users
      const allUsers = await User.find().select('name email role').lean();
      return NextResponse.json(
        {
          error: 'User not found',
          availableUsers: allUsers.map(u => ({
            name: u.name,
            email: u.email,
            role: u.role,
          })),
        },
        { status: 404 }
      );
    }

    // Check if already admin
    if (user.role === 'admin') {
      return NextResponse.json({
        message: 'User is already an admin',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Promote to admin
    user.role = 'admin';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin successfully',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      note: 'User needs to sign out and sign in again for changes to take effect',
    });
  } catch (error: any) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      {
        error: 'Failed to promote user',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * List all users (for debugging)
 * GET /api/promote-admin
 */
export async function GET() {
  try {
    await connectDB();
    
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
