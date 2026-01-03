import React, { useState, useEffect } from "react";
import { Plus, Calendar, Eye, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card } from "../app/components/ui/card";
import { Button } from "../app/components/ui/button";
import { Input } from "../app/components/ui/input";
import { Badge } from "../app/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../app/components/ui/table";
import { CreateAssignmentDialog } from "../app/components/CreateAssignmentDialog";
import { AssignmentDetailPanel } from "../app/components/AssignmentDetailPanel";
import type { UserRole } from "../app/types";

const getYearNumber = (yearStr: string): number => {
    switch (yearStr) {
        case "1st Year": return 1;
        case "2nd Year": return 2;
        case "3rd Year": return 3;
        case "4th Year": return 4;
        default: return 3;
    }
};

export function AssignmentsPage({ userRole, userDept, userYear }: { userRole: UserRole, userDept: string, userYear: string }) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [activeClassId, setActiveClassId] = useState<number | null>(null);

    const [filters, setFilters] = useState({
        year: getYearNumber(userYear),
        section: "A",
        subject: "All Subjects",
    });

    // 1. Fetch Classes once
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem('dam_token');
                const res = await fetch('/classes', { headers: { 'Authorization': token || '' } });
                if (res.ok) setClasses(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchClasses();
    }, []);

    // 2. Resolve Active Class ID
    useEffect(() => {
        const yearMap: any = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
        const label = yearMap[filters.year];
        const match = classes.find(c => {
            const name = (c.class_name || "").toLowerCase();
            return name.includes(label.toLowerCase()) && name.includes(filters.section.toLowerCase());
        });
        setActiveClassId(match ? match.id : null);
    }, [filters, classes]);

    // 3. Fetch Data from DB (Source of Truth)
    const fetchData = async () => {
        if (!activeClassId) {
            setAssignments([]);
            setStats(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('dam_token');
            const [asgRes, statRes] = await Promise.all([
                fetch(`/assignments?class_id=${activeClassId}`, { headers: { 'Authorization': token || '' } }),
                fetch(`/assignments/summary?class_id=${activeClassId}`, { headers: { 'Authorization': token || '' } })
            ]);

            if (asgRes.ok) setAssignments(await asgRes.json());
            if (statRes.ok) setStats(await statRes.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [activeClassId]);

    const handleAssignmentCreated = () => {
        setShowCreateDialog(false);
        fetchData();
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {userDept} • Year {filters.year} • Section {filters.section}
                    </p>
                </div>
                {userRole !== 'Student' && (
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> New Assignment
                    </Button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-blue-500">
                    <div className="bg-blue-50 p-3 rounded-lg"><FileText className="text-blue-600 w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold">{stats?.total_assignments || 0}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-green-500">
                    <div className="bg-green-50 p-3 rounded-lg"><CheckCircle className="text-green-600 w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Submitted</p>
                        <p className="text-xl font-bold">{stats?.total_submitted || 0}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-orange-500">
                    <div className="bg-orange-50 p-3 rounded-lg"><Clock className="text-orange-600 w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Late</p>
                        <p className="text-xl font-bold">{stats?.total_late || 0}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 border-l-4 border-red-500">
                    <div className="bg-red-50 p-3 rounded-lg"><AlertCircle className="text-red-600 w-5 h-5" /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                        <p className="text-xl font-bold">{stats?.total_pending || 0}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List */}
                <Card className="lg:col-span-2 overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Assignment List</h3>
                        {userRole !== 'Student' && (
                            <div className="flex gap-2">
                                <Input
                                    className="h-8 w-16 text-xs"
                                    value={filters.section}
                                    onChange={e => setFilters({ ...filters, section: e.target.value.toUpperCase() })}
                                    placeholder="Sec"
                                />
                            </div>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead>Title</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500 italic">Fetching assignments...</TableCell></TableRow>
                            ) : assignments.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-gray-500">No data found in database.</TableCell></TableRow>
                            ) : (
                                assignments.map(asg => (
                                    <TableRow key={asg.id} className={selectedAssignment?.id === asg.id ? "bg-blue-50/50" : "hover:bg-gray-50/50"}>
                                        <TableCell className="font-medium">{asg.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(asg.due_date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {userRole === 'Student' ? (
                                                <Badge variant="outline" className={asg.my_status === 'SUBMITTED' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                                                    {asg.my_status || 'NOT SUBMITTED'}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm font-medium text-blue-600">{asg.submitted_count}/{asg.total_students} Submissions</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedAssignment(asg)}>
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Focus Panel */}
                <div className="lg:col-span-1">
                    {selectedAssignment ? (
                        <AssignmentDetailPanel
                            assignment={selectedAssignment}
                            currentRole={userRole as any}
                            onExport={() => { }}
                        />
                    ) : (
                        <Card className="p-8 text-center border-dashed border-2 flex flex-col items-center justify-center h-full text-gray-400">
                            <FileText className="w-12 h-12 mb-2 opacity-20" />
                            <p>Select an assignment<br />to view details</p>
                        </Card>
                    )}
                </div>
            </div>

            {showCreateDialog && <CreateAssignmentDialog onClose={() => setShowCreateDialog(false)} onSuccess={handleAssignmentCreated} filters={{ ...filters, department: userDept, semester: 5 }} />}
        </div>
    );
}
