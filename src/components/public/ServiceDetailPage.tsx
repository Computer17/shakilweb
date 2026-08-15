import React from 'react';
import { ServiceItem } from '../../types';
import { AiClientAssistant } from './AiClientAssistant';
import {
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
  HelpCircle,
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface ServiceDetailPageProps {
  service: ServiceItem;
  onBack: () => void;
  onOrderService: (serviceId: string, initialContext?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
  onBack,
  onOrderService,
}) => {
  return (
    <div className="py-8 md:py-14 bg-slate-950 text-slate-100 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Services</span>
        </button>

        {/* Hero Banner Header */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                <Tag className="h-3.5 w-3.5" />
                <span>{service.category}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {service.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {service.shortIntro}
              </p>
            </div>

            {/* Pricing & Order Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shrink-0 md:w-72 space-y-3 text-center">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Configured Pricing</span>
                <span className="text-2xl font-extrabold text-white">
                  {service.pricingType === 'fixed'
                    ? `${service.currency || 'BDT'} ৳${service.priceAmount}`
                    : 'Discussion Based'}
                </span>
                {service.priceUnit && (
                  <span className="text-xs text-cyan-400 block mt-0.5 font-medium">
                    {service.priceUnit}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Est. Delivery: {service.estimatedDelivery}</span>
              </div>

              <button
                onClick={() => onOrderService(service.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Order Now</span>
              </button>

              <div className="text-[11px] text-emerald-400 flex items-center justify-center gap-1 pt-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>10-15 Min Admin Review Process</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout: Detailed Specs & AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Full Explanation */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-cyan-400" />
                <span>Full Explanation</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {service.fullExplanation}
              </p>
            </div>

            {/* What is Included / What is Not Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Included */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>What Is Included</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {service.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Included */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <span>What Is NOT Included</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {service.notIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Required Files & Required Info */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <span>Requirements Before Ordering</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-semibold text-slate-200 mb-2">Required Files:</h5>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    {service.requiredFiles.map((rf, idx) => (
                      <li key={idx}>{rf}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-slate-200 mb-2">Required Information:</h5>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    {service.requiredInfo.map((ri, idx) => (
                      <li key={idx}>{ri}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Real Work Examples */}
            {service.examples && service.examples.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Verified Work Examples</h3>
                <div className="grid grid-cols-1 gap-3">
                  {service.examples.map((ex, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-400">{ex.title}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {ex.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Specific FAQ */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  <span>Service FAQs</span>
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  {service.faqs.map((faq, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950">
                      <p className="font-semibold text-white mb-1">Q: {faq.question}</p>
                      <p className="text-slate-300 leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: AI Client Assistant */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <AiClientAssistant
                service={service}
                onProceedToOrderWithContext={(context) => onOrderService(service.id, context)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
