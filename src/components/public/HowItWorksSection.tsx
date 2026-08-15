import React from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
  FileCheck,
  Zap,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface HowItWorksSectionProps {
  onOrderService: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onOrderService }) => {
  const steps = [
    {
      num: '01',
      title: 'Select a Service',
      desc: 'Browse our 10 transparent services and pick the exact task you need help with.',
    },
    {
      num: '02',
      title: 'Read Service Details',
      desc: 'Check what is included, what is excluded, required files, and configured pricing.',
    },
    {
      num: '03',
      title: 'Ask AI Assistant',
      desc: 'Use our AI Assistant on the service page to clarify doubts or gather requirements.',
    },
    {
      num: '04',
      title: 'Submit Requirements & Files',
      desc: 'Attach your document files and specify any custom deadline or formatting preferences.',
    },
    {
      num: '05',
      title: '10–15 Minute Review',
      desc: 'Shakil reviews your task parameters or system auto-accept rules trigger if conditions met.',
    },
    {
      num: '06',
      title: 'Discuss Terms (If Needed)',
      desc: 'If custom review is required, connect directly on WhatsApp/Telegram/Messenger.',
    },
    {
      num: '07',
      title: 'Order Acceptance',
      desc: 'Order status changes to ACCEPTED with confirmed price and delivery estimate.',
    },
    {
      num: '08',
      title: 'Work Begins Promptly',
      desc: 'Work starts immediately with careful manual proofreading and quality verification.',
    },
    {
      num: '09',
      title: 'Work Delivered',
      desc: 'Receive your clean completed files (Word, Excel, Images, Code, PDFs).',
    },
    {
      num: '10',
      title: 'Agreed Payment Completion',
      desc: 'Payment handled securely according to agreed terms.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Clock className="h-3.5 w-3.5" />
            <span>Transparent 10-Step Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Order Acceptance & Delivery Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            No misleading promises, hidden fees, or fake instant guarantees. Every task is handled with clear step-by-step accountability.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="text-2xl font-black text-cyan-500/40">{step.num}</div>
              <h3 className="text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlight Banner: 10-15 Min Review */}
        <div className="mt-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg sm:text-2xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
              <Clock className="h-6 w-6 text-cyan-400" />
              <span>Why the 10–15 Minute Review Process?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              We review every document scan, table layout, or custom script before accepting your order to ensure Shakil has 100% capacity and expertise to fulfill your exact expectations.
            </p>
          </div>

          <button
            onClick={onOrderService}
            className="shrink-0 rounded-xl bg-cyan-500 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Start Your Order Request
          </button>
        </div>
      </div>
    </section>
  );
};
