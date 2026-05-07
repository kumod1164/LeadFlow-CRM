import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { UpdateLeadSchema } from '@/lib/validations/lead';
import { Types } from 'mongoose';

/**
 * GET /api/leads/[id]
 * Get a single lead by ID
 * Enforces role-based access control
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Fetch lead
    const lead = await Lead.findById(id).populate('assignedTo', 'name email');

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Apply role-based access check
    if (session.user.role === 'user') {
      // Sales_Users can only access their assigned leads
      if (
        !lead.assignedTo ||
        lead.assignedTo._id.toString() !== session.user.id
      ) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead
 * Tracks changes in timeline and triggers notifications
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    // Fetch existing lead
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Apply role-based access check
    if (session.user.role === 'user') {
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

    const data = validation.data;

    // Track changed fields for timeline
    const changes: string[] = [];
    const oldValues: any = {};

    if (data.name && data.name !== lead.name) {
      changes.push('name');
      oldValues.name = lead.name;
    }
    if (data.email && data.email !== lead.email) {
      changes.push('email');
      oldValues.email = lead.email;
    }
    if (data.phone !== undefined && data.phone !== lead.phone) {
      changes.push('phone');
      oldValues.phone = lead.phone;
    }
    if (data.company !== undefined && data.company !== lead.company) {
      changes.push('company');
      oldValues.company = lead.company;
    }
    if (data.stage && data.stage !== lead.stage) {
      changes.push('stage');
      oldValues.stage = lead.stage;
    }
    if (data.assignedTo !== undefined) {
      const newAssignedTo = data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : null;
      const oldAssignedTo = lead.assignedTo;

      if (
        (newAssignedTo && !oldAssignedTo) ||
        (!newAssignedTo && oldAssignedTo) ||
        (newAssignedTo &&
          oldAssignedTo &&
          newAssignedTo.toString() !== oldAssignedTo.toString())
      ) {
        changes.push('assignedTo');
        oldValues.assignedTo = oldAssignedTo;
        // TODO: Trigger assignment notification (will be implemented in task 18.1)
      }
    }
    if (data.followUpDate !== undefined) {
      const newDate = data.followUpDate ? new Date(data.followUpDate) : null;
      const oldDate = lead.followUpDate;

      if (
        (newDate && !oldDate) ||
        (!newDate && oldDate) ||
        (newDate && oldDate && newDate.getTime() !== oldDate.getTime())
      ) {
        changes.push('followUpDate');
        oldValues.followUpDate = oldDate;
        // TODO: Trigger follow-up notification (will be implemented in task 18.1)
      }
    }

    // Update lead fields
    if (data.name) lead.name = data.name;
    if (data.email) lead.email = data.email;
    if (data.phone !== undefined) lead.phone = data.phone;
    if (data.company !== undefined) lead.company = data.company;
    if (data.stage) lead.stage = data.stage;
    if (data.assignedTo !== undefined) {
      lead.assignedTo = data.assignedTo
        ? new Types.ObjectId(data.assignedTo)
        : undefined;
    }
    if (data.followUpDate !== undefined) {
      lead.followUpDate = data.followUpDate
        ? new Date(data.followUpDate)
        : undefined;
    }

    // Add timeline entry if changes were made
    if (changes.length > 0) {
      const details = changes
        .map((field) => {
          if (field === 'stage') {
            return `Stage: ${oldValues.stage} → ${data.stage}`;
          }
          return `${field} updated`;
        })
        .join(', ');

      lead.timeline.push({
        action: 'Lead updated',
        userId: new Types.ObjectId(session.user.id),
        userName: session.user.name || 'Unknown',
        details,
        timestamp: new Date(),
      });
    }

    await lead.save();

    // Populate assignedTo for response
    await lead.populate('assignedTo', 'name email');

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Error updating lead:', error);

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

/**
 * DELETE /api/leads/[id]
 * Delete a lead (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enforce Admin-only access
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

    // Delete lead
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
