'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, TrendingUp, PieChart, Users, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MonthlyLeadsChart } from '@/components/analytics/MonthlyLeadsChart';
import { ConversionRateChart } from '@/components/analytics/ConversionRateChart';
import { StageDistributionChart } from '@/components/analytics/StageDistributionChart';
import { LeadsByUserChart } from '@/components/analytics/LeadsByUserChart';

interface DateRange {
  from: Date;
  to: Date;
}

interface AnalyticsData {
  monthlyLeads: { month: string; count: number }[];
  conversionRate: { month: string; rate: number; total: number; won: number }[];
  stageDistribution: { stage: string; count: number }[];
  leadsByUser: { userName: string; count: number }[];
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const to = new Date();
    const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
    return { from, to };
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        dateFrom: dateRange.from.toISOString(),
        dateTo: dateRange.to.toISOString(),
      });

      const response = await fetch(`/api/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      setDateRange({ from, to });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40">
      <div className="p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your sales performance and pipeline health over time
            </p>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full md:w-[300px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-all',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col sm:flex-row gap-2 p-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">From</p>
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => handleDateRangeChange(date, dateRange.to)}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">To</p>
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => handleDateRangeChange(dateRange.from, date)}
                      initialFocus
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, color: 'from-blue-500 to-indigo-600', bg: 'from-white to-blue-50/30' },
              { icon: BarChart3, color: 'from-green-500 to-emerald-600', bg: 'from-white to-green-50/30' },
              { icon: PieChart, color: 'from-purple-500 to-pink-600', bg: 'from-white to-purple-50/30' },
              { icon: Users, color: 'from-orange-500 to-amber-600', bg: 'from-white to-orange-50/30' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className={`overflow-hidden border-0 shadow-md bg-gradient-to-br ${item.bg}`}>
                  <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="flex justify-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Leads Chart */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Leads Created</CardTitle>
                    <CardDescription>Monthly lead generation trends</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <MonthlyLeadsChart data={data.monthlyLeads} />
              </CardContent>
            </Card>

            {/* Conversion Rate Chart */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/30">
              <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Conversion Rate</CardTitle>
                    <CardDescription>Monthly win rate percentage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ConversionRateChart data={data.conversionRate} />
              </CardContent>
            </Card>

            {/* Stage Distribution Chart */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pipeline Distribution</CardTitle>
                    <CardDescription>Current leads by stage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <StageDistributionChart data={data.stageDistribution} />
              </CardContent>
            </Card>

            {/* Leads by User Chart */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-md bg-gradient-to-br from-white to-orange-50/30">
              <CardHeader className="border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Leads by User</CardTitle>
                    <CardDescription>Top 10 users by lead count</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <LeadsByUserChart data={data.leadsByUser} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State - No Data */}
        {!loading && !error && data && 
         data.monthlyLeads.length === 0 && 
         data.conversionRate.length === 0 && 
         data.stageDistribution.length === 0 && 
         data.leadsByUser.length === 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">No Analytics Data</h3>
                  <p className="text-gray-500 max-w-md">
                    There's no data available for the selected date range. Try adjusting your date range or create some leads to see analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
