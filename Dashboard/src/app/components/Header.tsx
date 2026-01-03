import { ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      {/* Context Selectors */}
      <div className="flex items-center gap-4">
        {/* Department Selector */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 backdrop-blur-sm">
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500">Department</span>
              <span className="text-sm text-slate-900">BE CSE</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Academic Year Selector */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 backdrop-blur-sm">
            <div className="flex flex-col items-start">
              <span className="text-xs text-slate-500">Academic Year</span>
              <span className="text-sm text-slate-900">3rd Year</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-900">Dr. Rajesh Kumar</p>
          <div className="flex items-center justify-end gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-xs">
              Staff
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white shadow-lg">
          <span>RK</span>
        </div>
      </div>
    </header>
  );
}
