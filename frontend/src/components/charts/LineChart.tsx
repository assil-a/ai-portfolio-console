import React from 'react';

interface DataPoint {
  month: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  height = 200, 
  color = '#10b981' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-tertiary">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const width = 600;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Create path for line
  const pathData = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Y-axis labels
  const yLabels = [
    { value: maxValue, y: padding },
    { value: Math.round((maxValue + minValue) / 2), y: padding + chartHeight / 2 },
    { value: minValue, y: padding + chartHeight }
  ];

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {yLabels.map((label, index) => (
          <line
            key={index}
            x1={padding}
            y1={label.y}
            x2={padding + chartWidth}
            y2={label.y}
            stroke="hsl(var(--border-hairline))"
            strokeWidth="1"
          />
        ))}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + ((maxValue - point.value) / range) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="hsl(var(--panel))"
              strokeWidth="2"
            />
          );
        })}

        {/* Y-axis labels */}
        {yLabels.map((label, index) => (
          <text
            key={index}
            x={padding - 10}
            y={label.y + 4}
            textAnchor="end"
            fill="hsl(var(--text-tertiary))"
            className="text-xs"
          >
            {label.value}
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fill="hsl(var(--text-tertiary))"
            className="text-xs"
            >
              {point.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default LineChart;
