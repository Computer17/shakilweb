import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  Heart,
  Globe,
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, siteSettings }) => {
  const whatsapp = siteSettings?.whatsappNumber || '01890193985';
  const telegram = siteSettings?.telegramUsername || '@DarkPrince_Dev';

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 pb-20 lg:pb-12 pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Principle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold text-lg">
                S
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">SHAKIL</span>
                <span className="ml-1 text-xs font-semibold text-cyan-400">WORKHUB</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reliable, affordable, and practical digital services. Built on honest communication, transparent pricing, and careful attention to detail.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Genuine Work Guarantee</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('service-detail', 'pdf-to-word')} className="hover:text-cyan-400 transition-colors">
                  PDF → Word Conversion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service-detail', 'pdf-to-excel')} className="hover:text-cyan-400 transition-colors">
                  PDF → Excel Conversion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service-detail', 'typing')} className="hover:text-cyan-400 transition-colors">
                  Computer Typing (Bengali/English)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service-detail', 'translation')} className="hover:text-cyan-400 transition-colors">
                  Bengali ↔ English Translation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('service-detail', 'image-editing')} className="hover:text-cyan-400 transition-colors">
                  Image Editing & Background Removal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="text-cyan-400 font-medium hover:underline">
                  View All 10 Services →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Information
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('portfolio')} className="hover:text-cyan-400 transition-colors">
                  Verified Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-cyan-400 transition-colors">
                  10-15 Min Review Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-cyan-400 transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('posts')} className="hover:text-cyan-400 transition-colors">
                  Guides & Tech Posts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official External Channels */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
              Direct Contact
            </h4>
            <p className="text-xs text-slate-400">
              Need urgent discussion or custom order guidance? Open official app directly:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Shakil,%20I%20have%20an%20order%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-900/50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp: {whatsapp}</span>
              </a>

              <a
                href={`https://t.me/${telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-sky-600/30 bg-sky-950/40 px-3 py-2 text-xs font-medium text-sky-400 hover:bg-sky-900/50 transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>Telegram: {telegram}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Shakil WorkHub. All rights reserved. Honest digital work & IT solutions.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Verified & Secured Platform</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
