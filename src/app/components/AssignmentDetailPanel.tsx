import { useState, useEffect } from "react";
import { Calendar, Award, User, FileText, Download, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { StudentSubmissionTable } from "./StudentSubmissionTable";
import type { UserRole } from "../types";

interface AssignmentDetailPanelProps {
  assignment: any | null;
  currentRole: UserRole;
  onExport: () => void;
}

export function AssignmentDetailPanel({
  assignment,
  currentRole,
  onExport,
}: AssignmentDetailPanelProps) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!assignment) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('dam_token');
        const res = await fetch(`/assignments/${assignment.id}/submissions`, {
          headers: { 'Authorization': token || '' }
        });
        if (res.ok) setSubmissions(await res.json());
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [assignment]);

  if (!assignment) {
    return (
      <Card className="p-6 h-full flex items-center justify-center border-dashed border-2 text-gray-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select an assignment to view details</p>
        </div>
      </Card>
    );
  }

  const submittedCount = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'LATE' || s.status === 'EVALUATED').length;
  const lateCount = submissions.filter(s => s.status === 'LATE').length;
  const pendingCount = submissions.length - submittedCount;

  const isDeadlinePassed = new Date(assignment.due_date) < new Date();

  return (
    <Card className="p-6 border border-gray-200 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Assignment View</h3>
        <Button size="sm" variant="outline" onClick={onExport} className="h-8 text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2 leading-tight">{assignment.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{assignment.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Subject</p>
              <p className="text-sm font-semibold">{assignment.subject || 'General'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Max Marks</p>
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Award className="w-3.5 h-3.5 text-blue-500" />
                {assignment.max_marks || 100}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Due Date</p>
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className={isDeadlinePassed ? "text-red-600" : ""}>
                  {new Date(assignment.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {currentRole !== 'Student' && (
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Student Progress
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">Submitted</p>
                  <p className="text-xl font-bold text-blue-700">{submittedCount}/{submissions.length}</p>
                </div>
                <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                  <p className="text-[10px] uppercase font-bold text-orange-400 mb-1">Late</p>
                  <p className="text-xl font-bold text-orange-700">{lateCount}</p>
                </div>
              </div>
            </div>
          )}

          {currentRole === 'Student' && (
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold mb-4">My Status</h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Badge className={assignment.my_status === 'SUBMITTED' ? "bg-green-600" : "bg-red-600"}>
                  {assignment.my_status || 'NOT SUBMITTED'}
                </Badge>
                {assignment.my_marks !== null && (
                  <span className="font-bold text-blue-600">{assignment.my_marks}/{assignment.max_marks} Marks</span>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions">
          {loading ? (
            <p className="text-center py-10 text-gray-500 animate-pulse">Loading submissions...</p>
          ) : (
            <StudentSubmissionTable
              assignment={assignment}
              submissions={submissions}
              currentRole={currentRole}
              onRefresh={async () => {
                const token = localStorage.getItem('dam_token');
                const res = await fetch(`/assignments/${assignment.id}/submissions`, {
                  headers: { 'Authorization': token || '' }
                });
                if (res.ok) setSubmissions(await res.json());
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
