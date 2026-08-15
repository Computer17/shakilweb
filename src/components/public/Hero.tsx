import React from 'react';
import {
  PlusCircle,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  MessageSquareText,
  Package,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-slate-800/60">
      {/* Background Subtle Gradient Lights */}
      <div className="absolute -top-24 left-1/2 -z-10 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 -z-10 h-[300px] w-[400px] bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Available for Work & Direct Orders</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Reliable Digital Services,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Done With Care.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Affordable and practical digital services including typing, translation, data entry, PDF/Word/Excel work, web research, image editing, website fixes, automation and product listing.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('order-service')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Order a Service</span>
            </button>

            <button
              onClick={() => onNavigate('track-order')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3.5 text-sm sm:text-base font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              <Package className="h-5 w-5 text-cyan-400" />
              <span>Track Project Status</span>
            </button>

            <button
              onClick={() => onNavigate('portfolio')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all"
            >
              <Briefcase className="h-5 w-5 text-slate-400" />
              <span>View My Work</span>
            </button>
          </div>

          {/* Trust Indicators Pill Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-slate-800/80 text-left">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Available for Work</h4>
                <p className="text-[11px] text-slate-400">Fast 10-15m review</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Honest Communication</h4>
                <p className="text-[11px] text-slate-400">Clear & truthful copy</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Clear Process</h4>
                <p className="text-[11px] text-slate-400">Step-by-step updates</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Affordable Pricing</h4>
                <p className="text-[11px] text-slate-400">Fixed & open terms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
