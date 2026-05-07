import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { UpdateStageSchema } from '@/lib/validations/lead';
import { Types } from 'mongoose';

/**
 * PATCH /api/pipeline
 * Update lead stage (Kanban drag-and-drop)
 * Enforces role-based access control
 */
export async function PATCH(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateStageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { leadId, stage } = validation.data;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Fetch lead
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Apply role-based access check
    if (session.user.role === 'user') {
      // Sales_Users can only update their assigned leads
      if (
        !lead.assignedTo ||
        lead.assignedTo.toString() !== session.user.id
      ) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Store old stage for timeline
    const oldStage = lead.stage;

    // Update stage
    lead.stage = stage;

    // Add timeline entry
    lead.timeline.push({
      action: 'Stage changed',
      userId: new Types.ObjectId(session.user.id),
      userName: session.user.name || 'Unknown',
      details: `Stage: ${oldStage} → ${stage}`,
      timestamp: new Date(),
    });

    await lead.save();

    // Populate assignedTo for response
    await lead.populate('assignedTo', 'name email');

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Error updating lead stage:', error);

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
