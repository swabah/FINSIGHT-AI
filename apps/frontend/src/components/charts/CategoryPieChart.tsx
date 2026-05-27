import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryPieChartProps {
  labels: string[];
  data: number[];
  colors: string[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ labels, data: chartData, colors }) => {
  const data = {
    labels,
    datasets: [
      {
        data: chartData,
        backgroundColor: colors.length > 0 ? colors : ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'],
        borderColor: '#000000',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += '₹' + context.parsed.toLocaleString();
            }
            return label;
          }
        }
      },
    },
  };

  if (chartData.length === 0 || chartData.every(v => v === 0)) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">No data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default CategoryPieChart;
