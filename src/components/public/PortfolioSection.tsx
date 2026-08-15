import React, { useState } from 'react';
import { PortfolioItem } from '../../types';
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Tag,
  Sparkles,
} from 'lucide-react';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ portfolio }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'PDF/Word/Excel',
    'Data Work',
    'Automation',
    'Image Work',
    'Product Listing',
    'Websites',
    'Research',
  ];

  const filteredItems = portfolio.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <section className="py-12 md:py-20 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>100% Genuine Work Delivered</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified Work Portfolio
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Real projects completed with accuracy and care. No fake entries or fabricated metrics.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.date}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Outcome & Result */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                    Verified Outcome:
                  </span>
                  <p className="text-xs text-slate-200">{item.result}</p>
                </div>

                {/* Tools & Tech Used */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Badge Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Real Client Deliverable</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-sm">
            No portfolio items found in category "{selectedCategory}".
          </div>
        )}
      </div>
    </section>
  );
};
