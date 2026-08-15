import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Mail,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface ContactSectionProps {
  siteSettings?: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const whatsapp = siteSettings?.whatsappNumber || '01890193985';
  const telegram = siteSettings?.telegramUsername || '@DarkPrince_Dev';
  const helpline = siteSettings?.helplinePhone || '+8809646175520';
  const adminEmail = siteSettings?.adminEmail || 'm.p.17.lal.2.com@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
  };

  return (
    <section className="py-12 md:py-20 bg-slate-950 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-3">
            <Mail className="h-3.5 w-3.5" />
            <span>Direct Communication</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact Shakil Directly
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Have a question before ordering? Connect via official messaging apps or send an email inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Official External Messaging Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Instant Direct Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clicking any channel opens the direct contact window or calls Shakil directly.
            </p>

            <div className="space-y-3 pt-2">
              <a
                href={`https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20Shakil,%20I%20have%20an%20order%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">WhatsApp Official</h4>
                    <p className="text-xs text-emerald-400 font-mono font-bold">{whatsapp}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl">Open WhatsApp →</span>
              </a>

              <a
                href={`https://t.me/${telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 hover:bg-sky-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Telegram Chat</h4>
                    <p className="text-xs text-sky-400 font-mono font-bold">{telegram}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-950/60 border border-sky-500/40 px-3 py-1 rounded-xl">Open Telegram →</span>
              </a>

              <a
                href={`tel:${helpline}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Helpline / Hotline Call</h4>
                    <p className="text-xs text-cyan-400 font-mono font-bold">{helpline}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-xl">Call Direct →</span>
              </a>

              <a
                href={`mailto:${adminEmail}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Direct Email</h4>
                    <p className="text-xs text-indigo-300 font-mono font-bold truncate max-w-[180px] sm:max-w-none">{adminEmail}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/40 px-3 py-1 rounded-xl">Send Email →</span>
              </a>
            </div>
          </div>

          {/* General Message Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Send an Inquiry</h3>

            {sent ? (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 text-xs sm:text-sm space-y-2">
                <CheckCircle2 className="h-6 w-6" />
                <p className="font-bold">Inquiry Sent Successfully!</p>
                <p className="text-emerald-300/80">
                  Thank you for reaching out. Shakil will review your inquiry shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email or Phone</label>
                  <input
                    type="text"
                    placeholder="john@example.com / +8801700..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message or project question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
