import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Button } from '../app/components/ui/button';
import { AttendanceTable } from '../app/components/AttendanceTable';
import { format } from 'date-fns';

export function AttendancePage({ userRole, userDept, userYear }: any) {
    const [viewMode, setViewMode] = useState<'dashboard' | 'marking'>('dashboard');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('/classes', {
                    headers: { 'Authorization': localStorage.getItem('dam_token') || '' }
                });
                if (res.ok) setClasses(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchClasses();
    }, []);

    const fetchAttendance = async (classId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('dam_token');
            const today = format(new Date(), 'yyyy-MM-dd');

            const sRes = await fetch(`/classes/${classId}/students`, {
                headers: { 'Authorization': token || '' }
            });
            const studentList = await sRes.json();

            const aRes = await fetch(`/attendance/semester?class_id=${classId}&date=${today}`, {
                headers: { 'Authorization': token || '' }
            });
            const attData = await aRes.json();

            const merged = studentList.map((s: any) => {
                const record = attData.attendance.find((r: any) => r.student_id === s.id);
                return {
                    id: s.id,
                    rollNo: s.id.toString().padStart(3, '0'),
                    name: s.full_name,
                    fn: record?.fn_status === 'PRESENT' ? 'Present' : 'Absent',
                    an: record?.an_status === 'PRESENT' ? 'Present' : 'Absent',
                    dayResult: record?.day_result || ''
                };
            });
            setStudents(merged);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('dam_token');
            const entries = students.map(s => ({
                student_id: s.id,
                fn_status: s.fn === 'Present' ? 'PRESENT' : 'ABSENT',
                an_status: s.an === 'Present' ? 'PRESENT' : 'ABSENT'
            }));
            const res = await fetch('/attendance/mark', {
                method: 'POST',
                headers: { 'Authorization': token || '', 'Content-Type': 'application/json' },
                body: JSON.stringify({ class_id: selectedClassId, entries })
            });
            if (res.ok) {
                alert("Attendance sync completed with real-time DB update.");
                setViewMode('dashboard');
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (e) { console.error(e); }
    };

    if (viewMode === 'marking') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setViewMode('dashboard')}>← Back</Button>
                    <Button className="bg-blue-600" onClick={handleSubmit}>Sync Changes to DB</Button>
                </div>
                <AttendanceTable
                    students={students}
                    onAttendanceChange={(id, pd, val) => {
                        setStudents(prev => prev.map(s => s.rollNo === id ? { ...s, [pd]: val } : s));
                    }}
                    isLocked={userRole === 'Student'}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Attendance Real-time Projection</h1>
            <div className="grid grid-cols-1 gap-4">
                {classes.map(c => (
                    <Card key={c.id} className="cursor-pointer hover:border-blue-500" onClick={() => {
                        setSelectedClassId(c.id);
                        setViewMode('marking');
                        fetchAttendance(c.id);
                    }}>
                        <CardHeader><CardTitle>{c.year} - {c.department}</CardTitle></CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
