'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface LeadsByUserChartProps {
  data: { userName: string; count: number }[];
}

const USER_COLORS = [
  '#f97316', // orange-500
  '#fb923c', // orange-400
  '#fdba74', // orange-300
  '#fed7aa', // orange-200
  '#ffedd5', // orange-100
  '#ea580c', // orange-600
  '#c2410c', // orange-700
  '#9a3412', // orange-800
  '#7c2d12', // orange-900
  '#fb923c', // orange-400 (repeat for 10th)
];

export function LeadsByUserChart({ data }: LeadsByUserChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  // Truncate long names for better display
  const formattedData = data.map(item => ({
    ...item,
    displayName: item.userName.length > 15 
      ? item.userName.substring(0, 15) + '...' 
      : item.userName,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formattedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        layout="horizontal"
      >
        <defs>
          {USER_COLORS.map((color, index) => (
            <linearGradient key={index} id={`userGradient${index}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
        <XAxis 
          dataKey="displayName" 
          stroke="#6b7280"
          fontSize={11}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
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
          formatter={(value: any, name: any, props: any) => {
            return [
              <div key="tooltip" className="space-y-1">
                <div className="text-orange-600 font-semibold text-base">
                  {value} leads
                </div>
                <div className="text-xs text-gray-500">
                  {props.payload.userName}
                </div>
              </div>,
              'Lead Count'
            ];
          }}
          cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
          iconType="circle"
        />
        <Bar
          dataKey="count"
          name="Leads Assigned"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-in-out"
        >
          {formattedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#userGradient${index % USER_COLORS.length})`}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(249, 115, 22, 0.2))',
              }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
