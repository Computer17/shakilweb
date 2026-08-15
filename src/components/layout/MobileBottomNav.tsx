import React from 'react';
import { Home, Layers, Briefcase, PlusCircle, Package } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-lg lg:hidden px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 items-center text-center">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onNavigate('services')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
            currentView === 'services' || currentView.startsWith('service-')
              ? 'text-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Services</span>
        </button>

        <button
          onClick={() => onNavigate('order-service')}
          className="flex flex-col items-center justify-center py-1 text-slate-950"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform">
            <PlusCircle className="h-6 w-6" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('track-order')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
            currentView === 'track-order' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Track</span>
        </button>

        <button
          onClick={() => onNavigate('portfolio')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
            currentView === 'portfolio' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Work</span>
        </button>
      </div>
    </div>
  );
};
