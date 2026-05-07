import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Root Not Found Page
 * 
 * Displayed when a user navigates to a route that doesn't exist.
 * Provides helpful navigation options and a premium, clean design.
 * 
 * **Validates: Requirement 12.3**
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 md:p-12 text-center space-y-6">
          {/* 404 Visual */}
          <div className="relative">
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              404
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 blur-3xl -z-10" />
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Page Not Found
            </h1>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Link href="/leads">
                <ArrowLeft className="w-4 h-4 mr-2" />
                View Leads
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Return to your dashboard
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            LeadFlow CRM • Manage your sales pipeline with confidence
          </p>
        </div>
      </div>
    </div>
  );
}
