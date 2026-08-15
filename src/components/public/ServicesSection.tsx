import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import {
  FileText,
  FileSpreadsheet,
  Keyboard,
  Languages,
  Database,
  Search,
  Image as ImageIcon,
  Wrench,
  ShoppingBag,
  Zap,
  ArrowRight,
  Clock,
  Tag,
  Sparkles,
} from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService: (serviceSlug: string) => void;
  onOrderService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
  onOrderService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Document Conversion', 'Data & Spreadsheets', 'Content Services', 'Design & Media', 'Web Development', 'E-commerce', 'Automation', 'Research'];

  const filteredServices = services.filter((s) => {
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (s.title || '').toLowerCase().includes(search) ||
      (s.shortIntro || '').toLowerCase().includes(search) ||
      (s.category || '').toLowerCase().includes(search);

    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="h-6 w-6 text-cyan-400" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="h-6 w-6 text-emerald-400" />;
      case 'Keyboard':
        return <Keyboard className="h-6 w-6 text-amber-400" />;
      case 'Languages':
        return <Languages className="h-6 w-6 text-indigo-400" />;
      case 'Database':
        return <Database className="h-6 w-6 text-blue-400" />;
      case 'Search':
        return <Search className="h-6 w-6 text-sky-400" />;
      case 'Image':
        return <ImageIcon className="h-6 w-6 text-purple-400" />;
      case 'Wrench':
        return <Wrench className="h-6 w-6 text-rose-400" />;
      case 'ShoppingBag':
        return <ShoppingBag className="h-6 w-6 text-teal-400" />;
      case 'Zap':
        return <Zap className="h-6 w-6 text-yellow-400" />;
      default:
        return <FileText className="h-6 w-6 text-cyan-400" />;
    }
  };

  return (
    <section className="py-12 md:py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>10 Dedicated Digital Services</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Services & Clear Terms
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Every service is defined with truthful deliverables, required files, estimated turnaround, and clear pricing terms.
          </p>

          {/* Search & Category Filter */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative max-w-md mx-auto w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search services (e.g., PDF to Word, Typing, Translation)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-cyan-500/5"
            >
              <div>
                {/* Category & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:border-cyan-500/40 transition-colors">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-md">
                    {service.category}
                  </span>
                </div>

                {/* Service Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>

                {/* Short Intro */}
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {service.shortIntro}
                </p>

                {/* Included Highlights */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-1.5">
                  {service.included.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Pricing & Delivery */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Est: {service.estimatedDelivery}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-sm">
                      {service.pricingType === 'fixed'
                        ? `${service.currency || 'BDT'} ৳${service.priceAmount}`
                        : 'Discussion'}
                    </span>
                    {service.priceUnit && (
                      <span className="text-[10px] text-slate-400 block">{service.priceUnit}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSelectService(service.slug)}
                    className="w-full text-center py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/60 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onOrderService(service.id)}
                    className="w-full text-center py-2 px-3 rounded-lg bg-cyan-500 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400 text-sm">No services matched your search term "{searchTerm}".</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
