import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { Types } from 'mongoose';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadForm } from '@/components/leads/LeadForm';
import { ExportButton } from '@/components/leads/ExportButton';

/**
 * Build MongoDB query from search params
 */
function buildLeadQuery(
  searchParams: { [key: string]: string | string[] | undefined },
  userId: string,
  role: string
) {
  const query: any = {};

  // Role-based filter
  if (role !== 'admin') {
    query.assignedTo = new Types.ObjectId(userId);
  }

  // Search filter (name, email, or company)
  if (searchParams.search && typeof searchParams.search === 'string') {
    query.$text = { $search: searchParams.search };
  }

  // Stage filter
  if (searchParams.stage && typeof searchParams.stage === 'string') {
    query.stage = searchParams.stage;
  }

  // Assigned user filter (Admin only)
  if (
    role === 'admin' &&
    searchParams.assignedTo &&
    typeof searchParams.assignedTo === 'string'
  ) {
    query.assignedTo = new Types.ObjectId(searchParams.assignedTo);
  }

  // Date range filter
  if (searchParams.dateFrom || searchParams.dateTo) {
    query.createdAt = {};
    if (searchParams.dateFrom && typeof searchParams.dateFrom === 'string') {
      query.createdAt.$gte = new Date(searchParams.dateFrom);
    }
    if (searchParams.dateTo && typeof searchParams.dateTo === 'string') {
      query.createdAt.$lte = new Date(searchParams.dateTo);
    }
  }

  return query;
}

/**
 * Fetch leads with pagination, filtering, and sorting
 */
async function getLeads(
  searchParams: { [key: string]: string | string[] | undefined },
  userId: string,
  role: string
) {
  await connectDB();

  // Parse pagination params
  const page = parseInt((searchParams.page as string) || '1', 10);
  const limit = parseInt((searchParams.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  // Parse sort params
  const sortBy = (searchParams.sortBy as string) || 'createdAt';
  const sortOrder = (searchParams.sortOrder as string) === 'asc' ? 1 : -1;

  // Build query
  const query = buildLeadQuery(searchParams, userId, role);

  // Execute query with pagination and sorting
  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    leads: JSON.parse(JSON.stringify(leads)), // Serialize for client
    total,
    page,
    totalPages,
  };
}

/**
 * Leads Page
 * 
 * Server Component that fetches initial leads data and renders the leads table
 * with filters and the create lead dialog.
 * 
 * **Validates: Requirements 6.1, 4.1**
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const { leads, total, page, totalPages } = await getLeads(
    searchParams,
    session.user.id,
    session.user.role
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Leads
            </h1>
            <p className="text-gray-600">
              Manage your sales leads and track their progress through the pipeline.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ExportButton />
            <LeadForm />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LeadFilters />
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LeadsTable
            initialLeads={leads}
            initialTotal={total}
            initialPage={page}
            initialTotalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
