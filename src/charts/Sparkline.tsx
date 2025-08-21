import React from 'react';
import { useTheme } from '../theme';

export interface SparklineProps {
  data: number[];
  color?: 'neonYellow' | 'neonPink' | 'neonGreen' | 'cobalt';
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Sparkline({
  data,
  color = 'neonGreen',
  width = 60,
  height = 20,
  strokeWidth = 1,
  className = '',
  style,
}: SparklineProps) {
  const { colors } = useTheme();

  if (!data || data.length < 2) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  const containerStyles: React.CSSProperties = {
    display: 'inline-block',
    ...style,
  };

  return (
    <div
      style={containerStyles}
      className={`sparkline ${className}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="sparkline__svg"
      >
        <path
          d={pathData}
          fill="none"
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default Sparkline;
