import React from 'react';
import { OrderStatus } from '../../types';
import {
  FileCheck,
  Search,
  Wrench,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface OrderTimelineProps {
  status: OrderStatus | string;
  createdAt?: string;
  estimatedCompletion?: string;
  updatedAt?: string;
  serviceTitle?: string;
  orderId?: string;
  compact?: boolean;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  estimatedCompletion,
  updatedAt,
  serviceTitle,
  orderId,
  compact = false,
}) => {
  // Determine overall project progress percentage and active step index based on status
  const getProgressDetails = (st: string) => {
    switch (st) {
      case 'NEW':
      case 'PENDING_REVIEW':
      case 'AI_REVIEW':
        return { percent: 20, activeStep: 0, label: 'Pending Review', color: 'cyan' };
      case 'ADMIN_REVIEW':
      case 'DISCUSSION':
        return { percent: 40, activeStep: 1, label: 'In Admin Review', color: 'amber' };
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return { percent: 70, activeStep: 2, label: 'Work In Progress', color: 'blue' };
      case 'WAITING_FOR_CLIENT':
        return { percent: 85, activeStep: 3, label: 'Awaiting Feedback', color: 'purple' };
      case 'COMPLETED':
        return { percent: 100, activeStep: 4, label: 'Completed', color: 'emerald' };
      case 'CANCELLED':
      case 'REJECTED':
        return { percent: 0, activeStep: -1, label: 'Cancelled / Rejected', color: 'rose' };
      default:
        return { percent: 25, activeStep: 0, label: 'Order Received', color: 'cyan' };
    }
  };

  const { percent, activeStep, label, color } = getProgressDetails(status);

  const steps = [
    {
      id: 0,
      title: 'Order Received',
      subtitle: 'Submitted & queued for review',
      detail: 'Request logged into Shakil WorkHub system. Files & requirements attached.',
      icon: FileCheck,
      estimatedTime: 'Instant',
    },
    {
      id: 1,
      title: 'Review & Scope',
      subtitle: '10–15 Min evaluation guarantee',
      detail: 'Shakil verifies scope, source files, and finalizes delivery estimate & price.',
      icon: Search,
      estimatedTime: '10-15 Mins',
    },
    {
      id: 2,
      title: 'Work In Progress',
      subtitle: 'Active execution & processing',
      detail: 'Work is underway. Conversion, development, formatting, or analysis being performed.',
      icon: Wrench,
      estimatedTime: estimatedCompletion || '24-48 Hours',
    },
    {
      id: 3,
      title: 'Quality Check',
      subtitle: 'Output verification & feedback',
      detail: 'Checking formatting, links, accuracy, and preparing final package files.',
      icon: Sparkles,
      estimatedTime: '1-2 Hours',
    },
    {
      id: 4,
      title: 'Completed & Delivered',
      subtitle: 'Final files & handoff ready',
      detail: 'Project completed successfully! All deliverables sent and verified.',
      icon: CheckCircle2,
      estimatedTime: 'Done',
    },
  ];

  const isCancelled = status === 'CANCELLED' || status === 'REJECTED';

  return (
    <div className={`w-full rounded-2xl border ${compact ? 'p-4 bg-slate-900/90 border-slate-800' : 'p-6 bg-slate-900/95 border-slate-800/90 shadow-xl'} space-y-6`}>
      {/* Header Bar with Overall Progress % and Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Progress</span>
            {orderId && <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{orderId}</span>}
          </div>
          {serviceTitle && <h3 className="text-base font-extrabold text-white mt-0.5">{serviceTitle}</h3>}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isCancelled
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : percent === 100
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {isCancelled ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : percent === 100 ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5 animate-pulse" />
            )}
            <span>{label}</span>
          </span>

          {/* Percentage Meter */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-extrabold text-white">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Visual Bar Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Overall Stage Timeline</span>
          <span>{isCancelled ? 'Halted' : `${percent}% Complete`}</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isCancelled
                ? 'bg-gradient-to-r from-rose-600 to-amber-600'
                : percent === 100
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold text-rose-200">Order Halted / Cancelled</p>
            <p className="text-[11px] text-rose-300/80 mt-0.5">
              This request was marked as cancelled or required changes before proceeding. Please contact Shakil directly via WhatsApp or Messenger to resume or update details.
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Step Timeline Nodes for Desktop */}
      <div className="hidden md:grid grid-cols-5 gap-2 relative pt-2">
        {/* Connecting Line behind nodes */}
        <div className="absolute top-7 left-8 right-8 h-1 bg-slate-800 -z-0" />
        <div
          className="absolute top-7 left-8 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 -z-0"
          style={{
            width: isCancelled
              ? '0%'
              : activeStep <= 0
              ? '0%'
              : `${(activeStep / 4) * 85}%`,
          }}
        />

        {steps.map((st) => {
          const isDone = !isCancelled && activeStep > st.id;
          const isCurrent = !isCancelled && activeStep === st.id;
          const isUpcoming = isCancelled || activeStep < st.id;

          const IconComp = st.icon;

          return (
            <div key={st.id} className="relative z-10 flex flex-col items-center text-center group">
              {/* Node Circle */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                    : isCurrent
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 ring-4 ring-cyan-500/30 scale-110'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <IconComp className={`h-4 w-4 ${isCurrent ? 'animate-bounce' : ''}`} />
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2.5 space-y-0.5">
                <span
                  className={`block text-xs font-bold ${
                    isDone
                      ? 'text-emerald-400'
                      : isCurrent
                      ? 'text-cyan-400'
                      : 'text-slate-400'
                  }`}
                >
                  {st.title}
                </span>
                <span className="block text-[10px] text-slate-500 leading-tight">
                  {st.subtitle}
                </span>
              </div>

              {/* Current Stage Indicator Pill */}
              {isCurrent && (
                <span className="mt-1.5 inline-block rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-cyan-300 border border-cyan-500/40 animate-pulse">
                  Active Now
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical Timeline Nodes for Mobile / Detailed View */}
      <div className="md:hidden space-y-3 pt-2">
        {steps.map((st) => {
          const isDone = !isCancelled && activeStep > st.id;
          const isCurrent = !isCancelled && activeStep === st.id;
          const isUpcoming = isCancelled || activeStep < st.id;
          const IconComp = st.icon;

          return (
            <div
              key={st.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md'
                  : isDone
                  ? 'bg-emerald-950/10 border-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : isCurrent
                    ? 'bg-cyan-400 text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <IconComp className="h-4 w-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isDone
                        ? 'text-emerald-400'
                        : isCurrent
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.title}
                  </span>
                  <span className="text-[10px] text-slate-500">{st.estimatedTime}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">{st.subtitle}</p>
                {isCurrent && (
                  <p className="text-[10px] text-cyan-300/90 mt-1 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                    {st.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info & Timestamps */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Shakil WorkHub Verified Progress Tracking</span>
        </div>
        {estimatedCompletion && (
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Target Delivery: <strong className="text-white">{estimatedCompletion}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
