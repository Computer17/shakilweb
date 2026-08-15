import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What services do you provide?',
      a: 'Shakil WorkHub provides 10 core digital services: Computer Typing (Bengali/English), Bengali ↔ English Translation, Small Website Fixes, Image Editing & Background Removal, PDF → Word Conversion, PDF → Excel Conversion, Data Entry & Spreadsheet Cleanup, Web Research, Workflow Automation, and E-commerce Product Listing.',
    },
    {
      q: 'How much does a service cost?',
      a: 'Services have transparent upfront pricing starting at ৳100 per 1000 words for typing, ৳150 per 10 pages for PDF to Word, ৳200 per 10 pages for PDF to Excel, or discussion-based rates for custom web fixes and automations.',
    },
    {
      q: 'Can I request a custom task?',
      a: 'Yes! If your task is a combination of data entry, web research, document formatting, or website fixes, simply submit an order request with your custom requirements.',
    },
    {
      q: 'Can I request a very small job?',
      a: 'Absolutely! We welcome single-page PDF conversions, quick image background removals, or small typing jobs.',
    },
    {
      q: 'Can I negotiate?',
      a: 'For bulk documents or recurring long-term projects, pricing can be adjusted during the 10–15 minute review discussion.',
    },
    {
      q: 'How long does work take?',
      a: 'Turnaround ranges from 2 hours for small PDF/image jobs up to 24–48 hours for large manuscripts, product catalogs, or automation scripts.',
    },
    {
      q: 'What files are required?',
      a: 'Required files depend on the service (e.g., original PDF files for conversion, raw photos for background removal, handwritten scans for typing).',
    },
    {
      q: 'Can I contact Admin directly?',
      a: 'Yes! You can contact Shakil directly via WhatsApp, Telegram, or Messenger official channels provided on every service page.',
    },
    {
      q: 'What happens if AI cannot answer my question?',
      a: 'If the AI Client Assistant is uncertain about your query, it will politely suggest connecting with Admin directly via WhatsApp, Telegram, or Messenger.',
    },
    {
      q: 'How does order acceptance work?',
      a: 'When you submit a request, it enters a 10–15 minute review process. If parameters match system Auto-Accept criteria, it is accepted automatically. Otherwise, Shakil reviews and confirms it.',
    },
    {
      q: 'Why do I need to wait 10–15 minutes?',
      a: 'This brief review allows Shakil to verify your files, confirm turn-around feasibility, and ensure 100% accurate deliverables before work begins.',
    },
    {
      q: 'How do I send my files?',
      a: 'You can upload files directly through our order modal (up to 25MB: PDF, DOCX, XLSX, Images, ZIP) or share links to Google Drive / Dropbox.',
    },
    {
      q: 'Can international clients order?',
      a: 'Yes! We serve clients globally in both English and Bengali, accepting USD and BDT payments.',
    },
    {
      q: 'What languages are supported?',
      a: 'Primary languages supported are English and Bengali (বাংলা). The AI Assistant and service workflows naturally understand both.',
    },
    {
      q: 'How are files handled and protected?',
      a: 'All files are uploaded through secure channels and stored with private access controls. Your client data is never shared publicly.',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Clear answers about pricing, turnaround times, file uploads, and order review.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-white hover:text-cyan-400 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
