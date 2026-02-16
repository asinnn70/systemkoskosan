
import React from 'react';
import { LayoutDashboard, Bed, Users, CreditCard, Sparkles, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rooms', label: 'Kamar', icon: Bed },
    { id: 'tenants', label: 'Penyewa', icon: Users },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <Bed className="w-8 h-8" />
          KosManager
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 w-full">
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
