import React, { useState } from 'react';
import { ClientRecord } from '../../types';
import { Users, Phone, Mail, MessageSquare, Clock, DollarSign, Plus, CheckCircle2 } from 'lucide-react';

interface AdminClientsManagerProps {
  clients: ClientRecord[];
}

export const AdminClientsManager: React.FC<AdminClientsManagerProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((c) => {
    const term = (searchTerm || '').toLowerCase();
    const nameStr = (c.name || '').toLowerCase();
    const emailStr = (c.email || '').toLowerCase();
    const phoneStr = (c.phone || '');
    const contactStr = (c.contact || '').toLowerCase();

    return (
      nameStr.includes(term) ||
      emailStr.includes(term) ||
      phoneStr.includes(searchTerm) ||
      contactStr.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Client Management</h1>
          <p className="text-xs text-slate-400">Track client contacts, order history, total spent, and communication notes.</p>
        </div>

        <input
          type="text"
          placeholder="Search clients by name, phone, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-full sm:w-64"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20">
                  {(client.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{client.name || 'Client'}</h3>
                  <span className="text-[10px] text-slate-400">Since {client.firstSeen || 'Recently'}</span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  client.paymentStatus === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {client.paymentStatus}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span>{client.phone || 'No phone recorded'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>{client.email || 'No email recorded'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Orders</span>
                <span className="font-bold text-white">{client.ordersCount}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Spent</span>
                <span className="font-bold text-cyan-400">
                  {client.totalSpentBDT !== undefined ? `৳${client.totalSpentBDT}` : client.totalSpent || '৳0'}
                </span>
              </div>
            </div>

            {client.notes && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-0.5">Admin Note:</span>
                {client.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
