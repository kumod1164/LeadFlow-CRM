import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationBell from '@/components/layout/NotificationBell';
import Sidebar from '@/components/layout/Sidebar';

/**
 * Modern dashboard layout with compact design
 * Aligned header and sidebar with professional spacing
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={session.user.role} userName={session.user.name || 'User'} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact top navigation bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                LeadFlow CRM
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              {/* User info - compact */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {session.user.role}
                  </p>
                </div>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(session.user.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content with compact padding */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
