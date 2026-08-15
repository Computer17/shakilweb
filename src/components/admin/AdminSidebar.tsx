import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Bot,
  Radar,
  Globe,
  Briefcase,
  Layers,
  FolderOpen,
  FileText,
  BarChart3,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onCloseMobile?: () => void;
  newOrdersCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  onCloseMobile,
  newOrdersCount = 0,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'orders', label: 'Orders OS', icon: <ShoppingBag className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'ai-rules', label: 'AI & Auto-Accept', icon: <Bot className="h-4 w-4" /> },
    { id: 'client-hunter', label: 'Global Client Hunter', icon: <Radar className="h-4 w-4" /> },
    { id: 'web-apps', label: 'Private Web Apps', icon: <Globe className="h-4 w-4" /> },
    { id: 'portfolio-mgr', label: 'Portfolio Items', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'workspace', label: 'Google Workspace', icon: <Globe className="h-4 w-4 text-cyan-400" /> },
    { id: 'site-cms', label: 'Site & Contact CMS', icon: <Globe className="h-4 w-4 text-cyan-400" /> },
    { id: 'services-mgr', label: 'Services Config', icon: <Layers className="h-4 w-4" /> },
    { id: 'files', label: 'Files Manager', icon: <FolderOpen className="h-4 w-4" /> },
    { id: 'posts-mgr', label: 'Public Posts', icon: <FileText className="h-4 w-4" /> },
    { id: 'analytics', label: 'Earnings & Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-4 h-full min-h-screen shrink-0">
      <div className="space-y-6">
        {/* Header Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold text-base">
              S
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">ADMIN OS</span>
              <span className="block text-[10px] font-semibold text-cyan-400">Shakil WorkHub</span>
            </div>
          </div>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 text-xs">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isOrdersTab = item.id === 'orders';
            const hasNewOrders = isOrdersTab && newOrdersCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {hasNewOrders && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-tight transition-all ${
                      isActive
                        ? 'bg-slate-950 text-cyan-300 border border-slate-800'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm shadow-amber-500/30 animate-pulse'
                    }`}
                  >
                    {newOrdersCount} NEW
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Admin Work OS</span>
        </button>
      </div>
    </aside>
  );
};
