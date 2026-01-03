import React, { useState, useEffect } from "react";
import { Calendar, Award, Eye } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import type { UserRole } from "../types";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  maxMarks: number;
  submitted_count: number;
  evaluated_count: number;
  total_students: number;
  my_status?: string;
  my_marks?: number;
  department?: string;
  year?: string;
  section?: string;
  semester?: number;
}

interface AssignmentListProps {
  currentRole: UserRole;
  filters: {
    department: string;
    year: number;
    section: string;
    semester: number;
    subject: string;
  };
  onSelectAssignment: (assignment: any) => void;
  selectedAssignmentId?: string;
}

export function AssignmentList({
  currentRole,
  filters,
  onSelectAssignment,
  selectedAssignmentId,
}: AssignmentListProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('dam_token');
        const cRes = await fetch('/classes', { headers: { 'Authorization': token || '' } });
        const classes = cRes.ok ? await cRes.json() : [];

        const yearMap: any = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
        const label = yearMap[filters.year];

        const targetClass = classes.find((c: any) => {
          const name = (c.class_name || "").toLowerCase();
          return name.includes(label.toLowerCase()) && name.includes(filters.section.toLowerCase());
        });

        if (targetClass) {
          const aRes = await fetch(`/assignments?class_id=${targetClass.id}`, {
            headers: { 'Authorization': token || '' }
          });
          if (aRes.ok) setAssignments(await aRes.json());
        } else {
          setAssignments([]);
        }
      } catch (e) {
        console.error(e);
        setAssignments([]);
      }
      setLoading(false);
    };
    fetchAssignments();
  }, [filters]);

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) return <Card className="p-6 text-center text-gray-500">Loading assignments...</Card>;

  if (currentRole === "Student") {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">My Assignments</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment Title</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No assignments found
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((asg) => (
                  <TableRow
                    key={asg.id}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedAssignmentId === asg.id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => onSelectAssignment(asg)}
                  >
                    <TableCell className="font-medium">{asg.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(asg.due_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          !asg.my_status || asg.my_status === "NOT_SUBMITTED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : asg.my_status === "SUBMITTED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                        }
                      >
                        {asg.my_status || "Not Submitted"}
                      </Badge>
                    </TableCell>
                    <TableCell>{asg.my_marks !== null ? asg.my_marks : "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onSelectAssignment(asg)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Assignment List</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Submission Status</TableHead>
              <TableHead>Evaluation Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((asg) => {
                const deadlinePassed = isDeadlinePassed(asg.due_date);
                return (
                  <TableRow
                    key={asg.id}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedAssignmentId === asg.id ? "bg-blue-50" : ""
                      }`}
                    onClick={() => onSelectAssignment(asg)}
                  >
                    <TableCell className="font-medium">{asg.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={deadlinePassed ? "text-red-600 font-medium" : ""}>
                          {new Date(asg.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium text-green-600">{asg.submitted_count}</span>
                        <span className="text-gray-500">/{asg.total_students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium text-blue-600">{asg.evaluated_count}</span>
                        <span className="text-gray-500">/{asg.total_students}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => onSelectAssignment(asg)}>
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
