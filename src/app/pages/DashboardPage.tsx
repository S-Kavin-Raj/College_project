import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { Users, FileText, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AdminRequestsPanel } from '../components/AdminRequestsPanel';

interface DashboardPageProps {
    userRole: string;
    userDept: string;
    userYear: string;
    userName?: string;
}

export function DashboardPage({ userRole, userDept, userYear, userName }: DashboardPageProps) {
    const [adminRequests, setAdminRequests] = useState([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('dam_token');
                const mRes = await fetch('/dashboard/metrics', {
                    headers: { 'Authorization': token || '' }
                });
                if (mRes.ok) setMetrics(await mRes.json());

                if (userRole === 'Advisor') {
                    const rRes = await fetch('/advisor/requests', {
                        headers: { 'Authorization': token || '' }
                    });
                    if (rRes.ok) setAdminRequests(await rRes.json());
                }
            } catch (e) {
                console.error("Dashboard fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userRole]);

    const handleProcessRequest = async (id: number, action: 'APPROVE' | 'REJECT', comment: string) => {
        try {
            const token = localStorage.getItem('dam_token');
            const res = await fetch('/advisor/requests/process', {
                method: 'POST',
                headers: { 'Authorization': token || '', 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: id, action, advisor_comment: comment })
            });
            if (res.ok) setAdminRequests(prev => prev.filter((r: any) => r.id !== id));
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading DB-Projected Dashboard...</div>;

    const hasAttendanceData = metrics?.attendanceGraph && metrics.attendanceGraph.length > 0;
    const hasSyllabusData = metrics?.syllabusGraph && metrics.syllabusGraph.length > 0;
    const hasAssignmentData = metrics?.assignmentGraph && metrics.assignmentGraph.length > 0;

    return (
        <div className="flex-1 p-6 md:p-8 overflow-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {userName || 'User'}</h1>
                <p className="text-slate-600">{userDept} - {userYear}</p>
            </div>

            {userRole === 'Advisor' && adminRequests.length > 0 && (
                <AdminRequestsPanel requests={adminRequests} onProcess={handleProcessRequest} />
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Attendance"
                    value={metrics?.attendance?.value || "0%"}
                    subtitle={metrics?.attendance?.subtitle || "No records"}
                    icon={Users}
                    iconBgColor="bg-gradient-to-br from-green-400 to-green-600"
                    iconColor="text-white"
                />
                <MetricCard
                    title="Assignments"
                    value={metrics?.assignments?.value || "0"}
                    subtitle={metrics?.assignments?.subtitle || "None"}
                    icon={FileText}
                    iconBgColor="bg-gradient-to-br from-blue-400 to-blue-600"
                    iconColor="text-white"
                />
                <MetricCard
                    title="Syllabus"
                    value={metrics?.syllabus?.value || "0%"}
                    subtitle={metrics?.syllabus?.subtitle || "No progress"}
                    icon={BookOpen}
                    iconBgColor="bg-gradient-to-br from-purple-400 to-purple-600"
                    iconColor="text-white"
                />
                <MetricCard
                    title="Action Items"
                    value={metrics?.actions?.value || "0"}
                    subtitle={metrics?.actions?.subtitle || "Pending items"}
                    icon={ClipboardList}
                    iconBgColor="bg-gradient-to-br from-orange-400 to-orange-600"
                    iconColor="text-white"
                />
            </div>

            {/* Attendance & Assignment Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Attendance Trend (Line) */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Weekly Attendance Trends</h3>
                    {hasAttendanceData ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={metrics.attendanceGraph}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-slate-400 italic">No attendance data logs found.</div>
                    )}
                </div>

                {/* Assignment Stats (Pie) */}
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Assignment Statistics</h3>
                    {hasAssignmentData ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={metrics.assignmentGraph} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                                        {metrics.assignmentGraph.map((entry: any, index: number) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {metrics.assignmentGraph.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-bold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center text-slate-400 italic">No assignment records to display.</div>
                    )}
                </div>
            </div>

            {/* Syllabus Row */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold mb-4">Syllabus Coverage per Subject</h3>
                    {hasSyllabusData ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={metrics.syllabusGraph}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {metrics.syllabusGraph.map((entry: any, index: number) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-slate-400 italic">No syllabus progress exists in database.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
