import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  HeartHandshake,
  DollarSign,
  Clock,
  UserCheck,
  Bot,
  ShieldAlert,
} from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustPoints = [
    {
      icon: <HeartHandshake className="h-5 w-5 text-cyan-400" />,
      title: 'Honest Communication',
      desc: 'No exaggerated claims, misleading jargon, or false promises. If a task cannot be done, you are informed immediately.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      title: 'Clear Service Details',
      desc: 'Every service explicitly lists deliverables, included features, excluded scope, and required input files.',
    },
    {
      icon: <DollarSign className="h-5 w-5 text-amber-400" />,
      title: 'No Hidden Charges',
      desc: 'Configured prices are upfront. Any custom scope adjustments are discussed and agreed upon prior to starting.',
    },
    {
      icon: <Clock className="h-5 w-5 text-sky-400" />,
      title: 'Clear Delivery Expectations',
      desc: 'Accurate turnaround estimates based on actual document length and project complexity.',
    },
    {
      icon: <UserCheck className="h-5 w-5 text-purple-400" />,
      title: 'Human + AI Assisted Support',
      desc: 'AI provides fast initial answers and order preparation, while Shakil personally manages all work execution.',
    },
    {
      icon: <Lock className="h-5 w-5 text-rose-400" />,
      title: 'Secure File Handling',
      desc: 'Your uploaded documents, spreadsheets, and photos remain strictly private and protected.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Built on Integrity & Trust</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Work With Shakil WorkHub?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Freelance work shouldn't involve guesswork, broken promises, or security risks. Here is how we guarantee peace of mind.
          </p>
        </div>

        {/* Grid of Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustPoints.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
