import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { Users, FileText, BookOpen, Bell, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data for charts
const attendanceData = [
  { day: 'Mon', attendance: 85 },
  { day: 'Tue', attendance: 88 },
  { day: 'Wed', attendance: 82 },
  { day: 'Thu', attendance: 90 },
  { day: 'Fri', attendance: 87 },
];

const syllabusData = [
  { name: 'Data Structures', value: 65, color: '#2563EB' },
  { name: 'DBMS', value: 45, color: '#7C3AED' },
  { name: 'OS', value: 30, color: '#10b981' },
];

const classStatusData = [
  { className: '3rd Year CSE A', period: 'FN', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-700' },
  { className: '3rd Year CSE B', period: 'FN', status: 'Approved', statusColor: 'bg-green-100 text-green-700' },
  { className: '3rd Year CSE C', period: 'AN', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-700' },
  { className: '3rd Year CSE D', period: 'AN', status: 'Locked', statusColor: 'bg-slate-100 text-slate-700' },
];

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-slate-900 mb-2">Welcome back, Dr. Rajesh Kumar</h1>
            <p className="text-slate-600">Department of Computer Science - 3rd Year</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Attendance Stats"
              value="88%"
              subtitle="Marked Today: 180/235"
              icon={Users}
              trend="up"
              iconBgColor="bg-gradient-to-br from-green-400 to-green-600"
              iconColor="text-white"
            />
            <MetricCard
              title="Assignment Status"
              value="12"
              subtitle="5 Pending Review"
              icon={FileText}
              iconBgColor="bg-gradient-to-br from-blue-400 to-blue-600"
              iconColor="text-white"
            />
            <MetricCard
              title="Syllabus Progress"
              value="45%"
              subtitle="Operations Completed"
              icon={BookOpen}
              iconBgColor="bg-gradient-to-br from-purple-400 to-purple-600"
              iconColor="text-white"
            />
            <MetricCard
              title="Alerts/Pending"
              value="3"
              subtitle="Classes Pending Approval"
              icon={Bell}
              iconBgColor="bg-gradient-to-br from-orange-400 to-orange-600"
              iconColor="text-white"
            />
          </div>

          {/* Data Visualization Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Line Chart - Weekly Attendance */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 mb-1">Weekly Attendance Trends</h3>
                  <p className="text-xs text-slate-500">Average attendance across the week</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">+5.2%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    dot={{ fill: '#2563EB', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Syllabus Completion */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-slate-900 mb-1">Syllabus Completion</h3>
                <p className="text-xs text-slate-500">By subject distribution</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={syllabusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {syllabusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {syllabusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Class Status Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-slate-900">Today's Class Status</h3>
              <p className="text-xs text-slate-500 mt-1">Manage attendance for today's classes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-slate-700 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-slate-700 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs text-slate-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classStatusData.map((classItem, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {classItem.className}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                          {classItem.period}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-md ${classItem.statusColor}`}>
                          {classItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            classItem.status === 'Locked' 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white hover:shadow-lg hover:shadow-blue-500/30'
                          }`}
                          disabled={classItem.status === 'Locked'}
                        >
                          {classItem.status === 'Locked' ? 'Locked' : 'Mark Attendance'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
