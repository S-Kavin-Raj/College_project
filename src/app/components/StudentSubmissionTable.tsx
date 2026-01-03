import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import type { UserRole } from "../types";

interface StudentSubmissionTableProps {
  assignment: any;
  submissions: any[];
  currentRole: UserRole;
  onRefresh?: () => void;
}

export function StudentSubmissionTable({
  assignment,
  submissions,
  currentRole,
  onRefresh
}: StudentSubmissionTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<{
    marks: number;
    remarks: string;
  }>({ marks: 0, remarks: "" });

  const handleEdit = (submission: any) => {
    setEditingId(submission.student_id);
    setEditData({
      marks: submission.marks || 0,
      remarks: submission.remarks || "",
    });
  };

  const handleSave = async (submissionId: number) => {
    if (!submissionId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('dam_token');
      const res = await fetch('/assignments/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({
          submission_id: submissionId,
          marks: editData.marks,
          feedback: editData.remarks
        })
      });

      if (res.ok) {
        setEditingId(null);
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to save grade");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({ marks: 0, remarks: "" });
  };

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Roll No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Remarks</TableHead>
            {currentRole !== "Student" && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center py-4 text-gray-500">No students found.</TableCell></TableRow>
          ) : (
            submissions.map((s) => {
              const isEditing = editingId === s.student_id;
              return (
                <TableRow key={s.student_id}>
                  <TableCell className="font-medium text-xs font-mono">{s.roll_no}</TableCell>
                  <TableCell className="text-sm">{s.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={s.status === 'SUBMITTED' ? "bg-green-50 text-green-700" : s.status === 'LATE' ? "bg-orange-50 text-orange-700" : s.status === 'EVALUATED' ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}>
                      {s.status || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        max={assignment.max_marks}
                        value={editData.marks}
                        onChange={(e) => setEditData({ ...editData, marks: parseInt(e.target.value) || 0 })}
                        className="w-16 h-8 text-xs"
                      />
                    ) : (
                      <span className="font-bold text-sm">
                        {s.marks !== null ? `${s.marks}/${assignment.max_marks}` : "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Textarea
                        value={editData.remarks}
                        onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                        className="min-h-[60px] text-xs"
                      />
                    ) : (
                      <span className="text-xs text-gray-500">{s.remarks || "-"}</span>
                    )}
                  </TableCell>
                  {currentRole !== "Student" && (
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSave(s.submission_id)} disabled={loading} className="h-7 w-7 p-0 bg-green-600">
                            <Save className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 w-7 p-0">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(s)}
                          disabled={!s.submission_id}
                          className="h-8 text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}