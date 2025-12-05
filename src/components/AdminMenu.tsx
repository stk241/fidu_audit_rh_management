import { Settings, Calendar, Users, LayoutDashboard } from 'lucide-react';

interface AdminMenuProps {
  activeView: 'dashboard' | 'saisons' | 'users';
  onViewChange: (view: 'dashboard' | 'saisons' | 'users') => void;
}

export function AdminMenu({ activeView, onViewChange }: AdminMenuProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'saisons' as const,
      label: 'Saisons',
      icon: Calendar,
    },
    {
      id: 'users' as const,
      label: 'Utilisateurs',
      icon: Users,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <Settings className="w-5 h-5 text-fidu-700" />
        <h3 className="text-sm font-semibold text-gray-900">Administration</h3>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-fidu-50 text-fidu-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
