import { FileText, CircleCheck, CircleAlert, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { mockAssignments, generateSubmissions } from "../data/mockData";

interface SummaryCardsProps {
  filters: {
    department: string;
    year: number;
    section: string;
    semester: number;
    subject: string;
  };
}

export function SummaryCards({ filters }: SummaryCardsProps) {
  // Filter assignments based on current filters
  const filteredAssignments = mockAssignments.filter((assignment) => {
    return (
      assignment.department === filters.department &&
      assignment.year === filters.year &&
      assignment.section === filters.section &&
      assignment.semester === filters.semester &&
      (filters.subject === "All Subjects" || assignment.subject === filters.subject)
    );
  });

  // Calculate statistics
  let totalSubmitted = 0;
  let totalLate = 0;
  let totalPending = 0;
  let totalExpected = 0;

  filteredAssignments.forEach((assignment) => {
    const submissions = generateSubmissions(assignment.id);
    totalExpected += submissions.length;

    submissions.forEach((sub) => {
      if (sub.status === "submitted" || sub.status === "evaluated") {
        totalSubmitted++;
      } else if (sub.status === "late") {
        totalLate++;
      } else if (sub.status === "not-submitted") {
        totalPending++;
      }
    });
  });

  const stats = [
    {
      title: "Total Assignments",
      value: filteredAssignments.length,
      icon: FileText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Submitted Assignments",
      value: totalSubmitted,
      icon: CircleCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Late Submissions",
      value: totalLate,
      icon: CircleAlert,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Pending Submissions",
      value: totalPending,
      icon: Clock,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
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