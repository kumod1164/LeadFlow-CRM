import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { Types } from 'mongoose';

/**
 * GET /api/analytics
 * Get aggregated analytics metrics
 * Admin-only endpoint
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');

    // Default date range: trailing 12 months
    const dateTo = dateToParam ? new Date(dateToParam) : new Date();
    const dateFrom = dateFromParam
      ? new Date(dateFromParam)
      : new Date(dateTo.getFullYear() - 1, dateTo.getMonth(), dateTo.getDate());

    // Build base match filter for date range
    const dateFilter = {
      createdAt: {
        $gte: dateFrom,
        $lte: dateTo,
      },
    };

    // Run four parallel aggregations
    const [
      monthlyLeadsData,
      conversionRateData,
      stageDistributionData,
      leadsByUserData,
    ] = await Promise.all([
      // 1. Monthly leads created
      Lead.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // 2. Conversion rate per month
      Lead.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: 1 },
            won: {
              $sum: {
                $cond: [{ $eq: ['$stage', 'Won'] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            total: 1,
            won: 1,
            rate: {
              $multiply: [
                {
                  $cond: [
                    { $eq: ['$total', 0] },
                    0,
                    { $divide: ['$won', '$total'] },
                  ],
                },
                100,
              ],
            },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // 3. Stage distribution (current state, not filtered by date)
      Lead.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 4. Leads by user (top 10)
      Lead.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        {
          $group: {
            _id: '$assignedTo',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            userName: '$user.name',
            count: 1,
          },
        },
      ]),
    ]);

    // Format monthly leads data
    const monthlyLeads = monthlyLeadsData.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count,
    }));

    // Format conversion rate data
    const conversionRate = conversionRateData.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      rate: Math.round(item.rate * 10) / 10, // Round to 1 decimal place
      total: item.total,
      won: item.won,
    }));

    // Format stage distribution data
    const stageDistribution = stageDistributionData.map((item) => ({
      stage: item._id,
      count: item.count,
    }));

    // Format leads by user data
    const leadsByUser = leadsByUserData.map((item) => ({
      userName: item.userName || 'Unknown',
      count: item.count,
    }));

    return NextResponse.json({
      monthlyLeads,
      conversionRate,
      stageDistribution,
      leadsByUser,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
