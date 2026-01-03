import { useState, useEffect } from "react";
import { Button } from "../app/components/ui/button";
import { Card } from "../app/components/ui/card";
import { Badge } from "../app/components/ui/badge";
import { Textarea } from "../app/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Calendar, Award, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { UserRole } from "../app/types";

export function StudentSubmissionPage({ onBack, userDept, userYear, userRole }: { onBack?: () => void, userDept: string, userYear: string, userRole: UserRole }) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [submissionNote, setSubmissionNote] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyAssignments = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('dam_token');
                const cRes = await fetch('/classes', { headers: { 'Authorization': token || '' } });
                const classes = await cRes.json();
                const match = classes.find((c: any) => c.year === userYear);

                if (match) {
                    const aRes = await fetch(`/assignments?class_id=${match.id}`, {
                        headers: { 'Authorization': token || '' }
                    });
                    if (aRes.ok) setAssignments(await aRes.json());
                }
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchMyAssignments();
    }, [userYear]);

    const handleSubmission = async () => {
        if (!selectedAssignment) return;
        try {
            const token = localStorage.getItem('dam_token');
            const res = await fetch('/assignments/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
                body: JSON.stringify({ assignment_id: selectedAssignment.id, note: submissionNote })
            });
            if (res.ok) {
                alert("Submitted!");
                // Refresh list
                const aRes = await fetch(`/assignments?class_id=${selectedAssignment.class_id}`, {
                    headers: { 'Authorization': token || '' }
                });
                if (aRes.ok) {
                    const list = await aRes.json();
                    setAssignments(list);
                    setSelectedAssignment(list.find((a: any) => a.id === selectedAssignment.id));
                }
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b shadow-sm mb-6">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <div className="flex items-center gap-4">
                        {onBack && <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>}
                        <h1 className="text-xl font-bold">My Assignments</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold">Assignment List</h2>
                    {assignments.map(asg => (
                        <Card
                            key={asg.id}
                            className={`p-4 cursor-pointer hover:shadow-md ${selectedAssignment?.id === asg.id ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedAssignment(asg)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium">{asg.title}</h3>
                                <Badge variant="outline" className={!asg.my_status || asg.my_status === 'NOT_SUBMITTED' ? 'bg-red-50' : 'bg-green-50'}>
                                    {asg.my_status || 'Not Submitted'}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500">Subject: {asg.subject}</p>
                            <p className="text-xs text-gray-500">Due: {new Date(asg.due_date).toLocaleDateString()}</p>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {selectedAssignment ? (
                        <>
                            <Card className="p-6">
                                <h2 className="text-xl font-bold mb-4">{selectedAssignment.title}</h2>
                                <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Max Marks: {selectedAssignment.max_marks || 100}</div>
                                </div>
                            </Card>

                            {selectedAssignment.my_status === 'SUBMITTED' || selectedAssignment.my_status === 'LATE' || selectedAssignment.my_status === 'EVALUATED' ? (
                                <Card className="p-6 bg-green-50">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Submission Successful</h3>
                                    <div className="space-y-2 text-sm text-green-700">
                                        <p>Status: {selectedAssignment.my_status}</p>
                                        <p>Marks: {selectedAssignment.my_marks !== null ? selectedAssignment.my_marks : 'Pending Evaluation'}</p>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Submit Assignment</h3>
                                    <Textarea
                                        placeholder="Add any notes..."
                                        value={submissionNote}
                                        onChange={(e) => setSubmissionNote(e.target.value)}
                                        className="mb-4"
                                    />
                                    <Button className="w-full bg-blue-600" onClick={handleSubmission}>
                                        <Upload className="w-4 h-4 mr-2" /> Submit
                                    </Button>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card className="p-12 text-center text-gray-400">Select an assignment to view details</Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentSubmissionPage;
