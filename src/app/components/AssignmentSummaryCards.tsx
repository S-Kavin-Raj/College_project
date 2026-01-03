import { FileText, CircleCheck, CircleAlert, Clock } from "lucide-react";
import { Card } from "./ui/card";

interface SummaryCardsProps {
  stats: {
    total_assignments: number;
    total_submitted: number;
    total_late: number;
    total_pending: number;
  } | null;
}

export function AssignmentSummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Assignments",
      value: stats?.total_assignments ?? 0,
      icon: FileText,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Submitted Assignments",
      value: stats?.total_submitted ?? 0,
      icon: CircleCheck,
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Late Submissions",
      value: stats?.total_late ?? 0,
      icon: CircleAlert,
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Submissions",
      value: stats?.total_pending ?? 0,
      icon: Clock,
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className={`text-3xl font-semibold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}