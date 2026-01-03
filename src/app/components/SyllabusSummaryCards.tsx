import React from 'react';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';

interface SyllabusSummaryCardsProps {
  totalSubjects: number;
  completedSubjects: number;
  inProgressSubjects: number;
  pendingSubjects: number;
}

export function SyllabusSummaryCards({
  totalSubjects,
  completedSubjects,
  inProgressSubjects,
  pendingSubjects,
}: SyllabusSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'All subjects',
    },
    {
      title: 'Syllabus Completed',
      value: completedSubjects,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Fully covered',
    },
    {
      title: 'Syllabus In Progress',
      value: inProgressSubjects,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'Currently teaching',
    },
    {
      title: 'Pending Syllabus',
      value: pendingSubjects,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      description: 'Not started yet',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{card.title}</p>
                <p className="text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.description}</p>
              </div>
              <div className={`p-3 ${card.bgColor} rounded-lg`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
