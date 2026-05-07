'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface ConversionRateChartProps {
  data: { month: string; rate: number; total: number; won: number }[];
}

export function ConversionRateChart({ data }: ConversionRateChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No data available for this period</p>
      </div>
    );
  }

  // Color gradient for bars based on conversion rate
  const getBarColor = (rate: number) => {
    if (rate >= 70) return '#10b981'; // green-500
    if (rate >= 50) return '#22c55e'; // green-400
    if (rate >= 30) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
            <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
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
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
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
            marginBottom: '8px',
          }}
          formatter={(value: any, name: any, props: any) => {
            if (name === 'rate' && typeof value === 'number') {
              return [
                <div key="tooltip" className="space-y-1">
                  <div className="text-green-600 font-semibold text-base">
                    {value.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {props.payload.won} won / {props.payload.total} total
                  </div>
                </div>,
                'Conversion Rate'
              ];
            }
            return [value, name];
          }}
          cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
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
          dataKey="rate"
          name="Conversion Rate (%)"
          radius={[8, 8, 0, 0]}
          animationDuration={1000}
          animationEasing="ease-in-out"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getBarColor(entry.rate)}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))',
              }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
