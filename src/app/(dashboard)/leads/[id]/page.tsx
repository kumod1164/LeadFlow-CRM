import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { Types } from 'mongoose';
import { LeadInfoPanel } from '@/components/leads/LeadInfoPanel';
import { NoteForm } from '@/components/leads/NoteForm';
import { NotesList } from '@/components/leads/NotesList';
import { ActivityTimeline } from '@/components/leads/ActivityTimeline';

/**
 * Lead Detail Page
 * 
 * Server Component that fetches a single lead by ID and renders the lead detail view.
 * Applies role-based access control (Sales Users can only view assigned leads).
 * Handles 404 if lead not found and 403 if user doesn't have access.
 * Includes notes section with NoteForm and NotesList.
 * Includes activity timeline showing all actions taken on the lead.
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
 */
export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Validate session
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  // Validate ObjectId format
  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  // Connect to database
  await connectDB();

  // Fetch lead with populated assignedTo
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email image')
    .lean();

  // Handle not found
  if (!lead) {
    notFound();
  }

  // Apply role-based access control
  // Sales Users can only view leads assigned to them
  if (session.user.role === 'user') {
    if (
      !lead.assignedTo ||
      lead.assignedTo._id.toString() !== session.user.id
    ) {
      // Return 403 Access Denied
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">
              You don't have permission to view this lead. Sales users can only
              access leads assigned to them.
            </p>
            <a
              href="/leads"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Leads
            </a>
          </div>
        </div>
      );
    }
  }

  // Serialize lead data for client components
  const serializedLead = JSON.parse(JSON.stringify(lead));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <a
                href="/leads"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </a>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                {serializedLead.name}
              </h1>
            </div>
            <p className="text-gray-600 ml-9">
              View and manage lead details, notes, and activity history.
            </p>
          </div>
        </div>

        {/* Lead Info Panel */}
        <LeadInfoPanel lead={serializedLead} userRole={session.user.role} />

        {/* Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Note Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes</h2>
            <NoteForm leadId={id} />
          </div>

          {/* Notes List */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              All Notes ({serializedLead.notes?.length || 0})
            </h2>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <NotesList notes={serializedLead.notes || []} />
            </div>
          </div>
        </div>

        {/* Activity Timeline Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Activity Timeline
          </h2>
          <ActivityTimeline timeline={serializedLead.timeline || []} />
        </div>
      </div>
    </div>
  );
}
