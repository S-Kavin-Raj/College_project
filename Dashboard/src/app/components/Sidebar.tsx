import { LayoutDashboard, UserCheck, FileText, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';

interface MenuItem {
  name: string;
  icon: React.ElementType;
  active?: boolean;
}

export function Sidebar() {
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Attendance', icon: UserCheck },
    { name: 'Assignments', icon: FileText },
    { name: 'Syllabus', icon: BookOpen },
    { name: 'Reports', icon: BarChart3 },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sticky top-0 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <h2 className="text-white">AcademiX</h2>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${
                  item.active
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white backdrop-blur-sm'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
