'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StageDistributionChartProps {
  data: { stage: string; count: number }[];
}

const STAGE_COLORS: Record<string, string> = {
  'New': '#3b82f6',        // blue-500
  'Contacted': '#8b5cf6',  // violet-500
  'Qualified': '#ec4899',  // pink-500
  'Won': '#10b981',        // green-500
  'Lost': '#ef4444',       // red-500
};

const STAGE_ORDER = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

export function StageDistributionChart({ data }: StageDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  // Sort data by stage order
  const sortedData = [...data].sort((a, b) => {
    return STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
  });

  const total = sortedData.reduce((sum, entry) => sum + entry.count, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for slices < 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <defs>
          {Object.entries(STAGE_COLORS).map(([stage, color]) => (
            <linearGradient key={stage} id={`gradient-${stage}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="count"
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#gradient-${entry.stage})`}
              stroke="#fff"
              strokeWidth={2}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                cursor: 'pointer',
              }}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            padding: '12px 16px',
          }}
          formatter={(value: any, name: any, props: any) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              <div key="tooltip" className="space-y-1">
                <div className="font-semibold text-base" style={{ color: STAGE_COLORS[props.payload.stage] }}>
                  {value} leads
                </div>
                <div className="text-xs text-gray-500">
                  {percentage}% of total
                </div>
              </div>,
              props.payload.stage
            ];
          }}
        />
        <Legend 
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: 500,
          }}
          iconType="circle"
          formatter={(value, entry: any) => {
            const count = entry.payload.count;
            const percentage = ((count / total) * 100).toFixed(0);
            return `${value} (${percentage}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
