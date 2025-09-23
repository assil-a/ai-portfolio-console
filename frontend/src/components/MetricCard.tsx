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
  iconColor = 'text-accent'
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-danger';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <Card className="luxe-panel elev-1 hover:elev-2 transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-data-md text-text-tertiary mb-1">{title}</p>
            <p className="text-2xl font-semibold text-text-primary mb-1">{value}</p>
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
