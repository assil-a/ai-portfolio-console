import React from 'react';
import { Card, CardContent } from './ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  iconColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconColor = 'text-green-500'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {change && (
              <p className={`text-sm font-medium ${getChangeColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
