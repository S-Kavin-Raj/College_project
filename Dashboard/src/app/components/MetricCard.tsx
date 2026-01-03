interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  iconBgColor: string;
  iconColor: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, iconBgColor, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-slate-900">{value}</h3>
            {trend && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center shadow-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
