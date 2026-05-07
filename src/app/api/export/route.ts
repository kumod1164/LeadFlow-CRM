import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { Types } from 'mongoose';
import { format } from 'date-fns';

/**
 * GET /api/export
 * Export leads as CSV file
 * Admin-only endpoint
 * Supports same filters as GET /api/leads (search, stage, assignedTo, date range)
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters (same as GET /api/leads but without pagination)
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build query
    const query: any = {};

    // Apply search filter (text search on name, email, company)
    if (search) {
      query.$text = { $search: search };
    }

    // Apply stage filter
    if (stage) {
      query.stage = stage;
    }

    // Apply assignedTo filter
    if (assignedTo) {
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

    // Fetch all matching leads (no pagination)
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Build CSV string
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Stage',
      'Assigned User',
      'Follow Up Date',
      'Created At',
    ];

    // Helper function to escape CSV values
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // Escape double quotes by doubling them
      const escaped = stringValue.replace(/"/g, '""');
      // Wrap in quotes if contains comma, newline, or quote
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    };

    // Build CSV rows
    const rows = leads.map((lead) => {
      const assignedUserName = (lead.assignedTo as any)?.name || '';
      const followUpDate = lead.followUpDate
        ? format(new Date(lead.followUpDate), 'yyyy-MM-dd')
        : '';
      const createdAt = format(new Date(lead.createdAt), 'yyyy-MM-dd');

      return [
        escapeCsvValue(lead.name),
        escapeCsvValue(lead.email),
        escapeCsvValue(lead.phone || ''),
        escapeCsvValue(lead.company || ''),
        escapeCsvValue(lead.stage),
        escapeCsvValue(assignedUserName),
        escapeCsvValue(followUpDate),
        escapeCsvValue(createdAt),
      ].join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Return CSV response with appropriate headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
