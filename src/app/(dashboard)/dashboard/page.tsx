import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Lead from '@/models/Lead';
import { Types } from 'mongoose';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Target 
} from 'lucide-react';

async function getDashboardStats(userId: string, role: string) {
  await connectDB();

  // Build role-based filter
  const roleFilter = role === 'admin' 
    ? {} 
    : { assignedTo: new Types.ObjectId(userId) };

  // Fetch all leads with role filter
  const leads = await Lead.find(roleFilter).lean();

  // Calculate stats
  const totalLeads = leads.length;
  const wonLeads = leads.filter(lead => lead.stage === 'Won').length;
  const lostLeads = leads.filter(lead => lead.stage === 'Lost').length;
  const totalDeals = wonLeads + lostLeads;
  const conversionRate = totalLeads > 0 
    ? ((wonLeads / totalLeads) * 100).toFixed(1) 
    : '0.0';

  return {
    totalLeads,
    totalDeals,
    wonLeads,
    lostLeads,
    conversionRate,
  };
}

async function getRecentActivity(userId: string, role: string) {
  await connectDB();

  // Build role-based filter
  const roleFilter = role === 'admin' 
    ? {} 
    : { assignedTo: new Types.ObjectId(userId) };

  // Fetch leads with timeline entries
  const leads = await Lead.find(roleFilter)
    .select('name timeline')
    .sort({ 'timeline.timestamp': -1 })
    .limit(50)
    .lean();

  // Flatten and sort all timeline entries
  const allActivities = leads.flatMap(lead =>
    lead.timeline.map(entry => ({
      ...entry,
      leadName: lead.name,
    }))
  );

  // Sort by timestamp and take last 10
  const recentActivities = allActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return recentActivities;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(session.user.id, session.user.role),
    getRecentActivity(session.user.id, session.user.role),
  ]);

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {session.user.name?.split(' ')[0] || 'User'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          gradient="from-blue-500 to-indigo-600"
        />
        
        <StatCard
          title="Total Deals"
          value={stats.totalDeals}
          icon={Target}
          gradient="from-purple-500 to-pink-600"
        />
        
        <StatCard
          title="Won Deals"
          value={stats.wonLeads}
          icon={CheckCircle2}
          gradient="from-green-500 to-emerald-600"
        />
        
        <StatCard
          title="Lost Deals"
          value={stats.lostLeads}
          icon={XCircle}
          gradient="from-red-500 to-rose-600"
        />
        
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          gradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* Compact Activity and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Recent Activity
          </h3>
          <RecentActivity activities={recentActivity} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Pipeline Overview
          </h3>
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
