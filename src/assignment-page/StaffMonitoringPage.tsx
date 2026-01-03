import { useState, useEffect } from "react";
import { Button } from "../app/components/ui/button";
import { Card } from "../app/components/ui/card";
import { Badge } from "../app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../app/components/ui/select";
import { Input } from "../app/components/ui/input";
import { Textarea } from "../app/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../app/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../app/components/ui/table";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    Users,
    Edit
} from "lucide-react";

export function StaffMonitoringPage({ onBack, userDept, userYear, filters: initialFilters }: any) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showMarksDialog, setShowMarksDialog] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [marks, setMarks] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    // FETCH ASSIGNMENTS
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('dam_token');
                const cRes = await fetch('/classes', { headers: { 'Authorization': token || '' } });
                const classes = await cRes.json();
                const yearMap: any = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                const match = classes.find((c: any) => c.year === yearMap[initialFilters.year]);

                if (match) {
                    const aRes = await fetch(`/assignments?class_id=${match.id}`, {
                        headers: { 'Authorization': token || '' }
                    });
                    if (aRes.ok) {
                        const list = await aRes.json();
                        setAssignments(list);
                        if (list.length > 0) setSelectedAssignment(list[0]);
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchAssignments();
    }, [initialFilters.year]);

    // FETCH SUBMISSIONS
    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!selectedAssignment) return;
            try {
                const token = localStorage.getItem('dam_token');
                const sRes = await fetch(`/assignments/${selectedAssignment.id}/submissions`, {
                    headers: { 'Authorization': token || '' }
                });
                if (sRes.ok) setSubmissions(await sRes.json());
            } catch (e) { console.error(e); }
        };
        fetchSubmissions();
    }, [selectedAssignment]);

    const handleSaveMarks = async () => {
        if (!selectedSubmission) return;
        try {
            const token = localStorage.getItem('dam_token');
            const res = await fetch('/assignments/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
                body: JSON.stringify({
                    submission_id: selectedSubmission.submission_id,
                    marks: parseInt(marks),
                    feedback: remarks
                })
            });
            if (res.ok) {
                alert("Marks saved!");
                setShowMarksDialog(false);
                // Refresh submissions
                const sRes = await fetch(`/assignments/${selectedAssignment.id}/submissions`, {
                    headers: { 'Authorization': token || '' }
                });
                if (sRes.ok) setSubmissions(await sRes.json());
            }
        } catch (e) { console.error(e); }
    };

    const stats = {
        total: submissions.length,
        submitted: submissions.filter(s => s.status && s.status !== 'NOT_SUBMITTED').length,
        late: submissions.filter(s => s.status === 'LATE').length,
        pending: submissions.filter(s => !s.status || s.status === 'NOT_SUBMITTED').length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b shadow-sm mb-6">
                <div className="container mx-auto px-4 py-6 max-w-7xl flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <h1 className="text-xl font-bold">Assignment Monitoring</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 bg-blue-50">
                        <p className="text-xs text-blue-600 font-semibold mb-1 uppercase">Total Students</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.total}</span>
                            <Users className="w-8 h-8 text-blue-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-green-50">
                        <p className="text-xs text-green-600 font-semibold mb-1 uppercase">Submitted</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.submitted}</span>
                            <CheckCircle2 className="w-8 h-8 text-green-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-orange-50">
                        <p className="text-xs text-orange-600 font-semibold mb-1 uppercase">Late</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.late}</span>
                            <Clock className="w-8 h-8 text-orange-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-red-50">
                        <p className="text-xs text-red-600 font-semibold mb-1 uppercase">Not Submitted</p>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{stats.pending}</span>
                            <XCircle className="w-8 h-8 text-red-200" />
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="font-semibold px-2">Select Assignment</h2>
                        {assignments.map(asg => (
                            <Card
                                key={asg.id}
                                className={`p-4 cursor-pointer hover:bg-white transition-colors ${selectedAssignment?.id === asg.id ? 'bg-white ring-1 ring-blue-500 shadow-md' : 'bg-gray-50'}`}
                                onClick={() => setSelectedAssignment(asg)}
                            >
                                <p className="text-sm font-medium">{asg.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{asg.subject}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-3">
                        <Card className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Marks</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map(sub => (
                                        <TableRow key={sub.student_id}>
                                            <TableCell className="font-medium">{sub.full_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={!sub.status || sub.status === 'NOT_SUBMITTED' ? 'bg-red-50' : 'bg-green-50'}>
                                                    {sub.status || 'Not Submitted'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{sub.marks !== null ? `${sub.marks}/${selectedAssignment?.max_marks || 100}` : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {sub.submission_id && (
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setSelectedSubmission(sub);
                                                        setMarks(sub.marks?.toString() || "");
                                                        setRemarks(sub.remarks || "");
                                                        setShowMarksDialog(true);
                                                    }}>
                                                        <Edit className="w-3 h-3 mr-1" /> Grade
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={showMarksDialog} onOpenChange={setShowMarksDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Enter Marks</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm font-medium">Student: {selectedSubmission?.full_name}</p>
                        <div>
                            <label className="text-sm">Marks</label>
                            <Input type="number" value={marks} onChange={e => setMarks(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm">Feedback</label>
                            <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveMarks} className="bg-blue-600">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
