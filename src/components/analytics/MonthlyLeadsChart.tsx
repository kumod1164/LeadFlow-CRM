'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyLeadsChartProps {
  data: { month: string; count: number }[];
}

export function MonthlyLeadsChart({ data }: MonthlyLeadsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No data available for this period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            padding: '12px 16px',
          }}
          labelStyle={{
            color: '#1f2937',
            fontWeight: 600,
            marginBottom: '4px',
          }}
          itemStyle={{
            color: '#3b82f6',
            fontSize: '14px',
            fontWeight: 500,
          }}
          cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
          iconType="circle"
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Leads Created"
          stroke="url(#colorLeads)"
          strokeWidth={3}
          dot={{ 
            fill: '#3b82f6', 
            strokeWidth: 2, 
            r: 5,
            stroke: '#fff',
          }}
          activeDot={{ 
            r: 7, 
            fill: '#3b82f6',
            stroke: '#fff',
            strokeWidth: 3,
            style: { 
              filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))',
            }
          }}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
