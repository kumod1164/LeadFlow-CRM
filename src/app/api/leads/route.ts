import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { CreateLeadSchema } from '@/lib/validations/lead';
import { Types } from 'mongoose';

/**
 * GET /api/leads
 * List leads with pagination, search, filtering, and sorting
 * Supports role-based access control
 */
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with role-based filter
    const query: any = {};

    // Apply role-based access control
    if (session.user.role === 'user') {
      // Sales_Users can only see their assigned leads
      query.assignedTo = new Types.ObjectId(session.user.id);
    }

    // Apply search filter (text search on name, email, company)
    if (search) {
      query.$text = { $search: search };
    }

    // Apply stage filter
    if (stage) {
      query.stage = stage;
    }

    // Apply assignedTo filter (Admin only)
    if (assignedTo && session.user.role === 'admin') {
      query.assignedTo = new Types.ObjectId(assignedTo);
    }

    // Apply date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead
 * Auto-assigns to authenticated user if Sales_User role
 */
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = CreateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // For Sales_Users, auto-set assignedTo to authenticated user
    if (session.user.role === 'user') {
      data.assignedTo = session.user.id;
    }

    // Convert assignedTo string to ObjectId if present
    const leadData: any = {
      ...data,
      assignedTo: data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : undefined,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
    };

    // Create lead with initial timeline entry
    leadData.timeline = [
      {
        action: 'Lead created',
        userId: new Types.ObjectId(session.user.id),
        userName: session.user.name || 'Unknown',
        timestamp: new Date(),
      },
    ];

    const lead = await Lead.create(leadData);

    // Populate assignedTo for response
    await lead.populate('assignedTo', 'name email');

    // TODO: If assignedTo is set, trigger notification creation (will be implemented in task 18.1)

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: Object.values(error.errors).map((e: any) => e.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
