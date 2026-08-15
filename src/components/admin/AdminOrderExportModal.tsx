import React, { useState } from 'react';
import { OrderRequest } from '../../types';
import {
  FileSpreadsheet,
  Download,
  X,
  Check,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  DollarSign,
  ShieldAlert,
  Flame,
  CheckCircle2,
  FileText,
  Table,
} from 'lucide-react';

export type ExportFormat = 'csv' | 'excel';
export type ExportScope = 'all' | 'filtered' | 'active';

export interface ExportFieldOption {
  id: string;
  label: string;
  category: 'Core' | 'Client' | 'Financial & Timeline' | 'Requirements & Notes';
  defaultSelected: boolean;
  getValue: (order: OrderRequest) => string | number;
}

export const EXPORT_FIELD_DEFINITIONS: ExportFieldOption[] = [
  // Core
  {
    id: 'id',
    label: 'Order ID',
    category: 'Core',
    defaultSelected: true,
    getValue: (o) => o.id,
  },
  {
    id: 'priority',
    label: 'Priority',
    category: 'Core',
    defaultSelected: true,
    getValue: (o) => o.priority || 'Medium',
  },
  {
    id: 'status',
    label: 'Status',
    category: 'Core',
    defaultSelected: true,
    getValue: (o) => o.status,
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    category: 'Core',
    defaultSelected: true,
    getValue: (o) => o.createdAt || '',
  },
  {
    id: 'updatedAt',
    label: 'Last Updated',
    category: 'Core',
    defaultSelected: false,
    getValue: (o) => o.updatedAt || o.createdAt || '',
  },

  // Client
  {
    id: 'clientName',
    label: 'Client Name',
    category: 'Client',
    defaultSelected: true,
    getValue: (o) => o.clientName,
  },
  {
    id: 'clientPhone',
    label: 'Client Phone',
    category: 'Client',
    defaultSelected: true,
    getValue: (o) => o.clientPhone || '',
  },
  {
    id: 'clientEmail',
    label: 'Client Email',
    category: 'Client',
    defaultSelected: true,
    getValue: (o) => o.clientEmail || '',
  },
  {
    id: 'contactPlatform',
    label: 'Contact Platform',
    category: 'Client',
    defaultSelected: false,
    getValue: (o) => o.contactPlatform || 'WhatsApp',
  },
  {
    id: 'emailSubscribed',
    label: 'Email Notifications',
    category: 'Client',
    defaultSelected: false,
    getValue: (o) => (o.emailSubscribed ? 'Yes' : 'No'),
  },

  // Financial & Timeline
  {
    id: 'serviceTitle',
    label: 'Service Title',
    category: 'Financial & Timeline',
    defaultSelected: true,
    getValue: (o) => o.serviceTitle,
  },
  {
    id: 'budget',
    label: 'Initial Budget',
    category: 'Financial & Timeline',
    defaultSelected: true,
    getValue: (o) => o.budget || '',
  },
  {
    id: 'price',
    label: 'Agreed Price',
    category: 'Financial & Timeline',
    defaultSelected: true,
    getValue: (o) => o.price || o.budget || '',
  },
  {
    id: 'requestedDelivery',
    label: 'Requested Delivery',
    category: 'Financial & Timeline',
    defaultSelected: true,
    getValue: (o) => o.requestedDelivery || '',
  },
  {
    id: 'estimatedCompletion',
    label: 'Estimated / Confirmed Delivery',
    category: 'Financial & Timeline',
    defaultSelected: true,
    getValue: (o) => o.estimatedCompletion || o.requestedDelivery || '',
  },

  // Requirements & Notes
  {
    id: 'requirements',
    label: 'Task Requirements & Specs',
    category: 'Requirements & Notes',
    defaultSelected: true,
    getValue: (o) => o.requirements || '',
  },
  {
    id: 'fileCount',
    label: 'Attached Files Count',
    category: 'Requirements & Notes',
    defaultSelected: true,
    getValue: (o) => o.files?.length || o.fileCount || 0,
  },
  {
    id: 'filesList',
    label: 'Attached File Names',
    category: 'Requirements & Notes',
    defaultSelected: false,
    getValue: (o) => o.files?.map((f) => f.name).join('; ') || 'None',
  },
  {
    id: 'reviewRating',
    label: 'Client Review (Rating)',
    category: 'Requirements & Notes',
    defaultSelected: false,
    getValue: (o) => (o.review ? `${o.review.rating}/5` : 'N/A'),
  },
  {
    id: 'reviewComment',
    label: 'Client Review Comment',
    category: 'Requirements & Notes',
    defaultSelected: false,
    getValue: (o) => o.review?.comment || '',
  },
  {
    id: 'adminNotes',
    label: 'Public Admin Notes',
    category: 'Requirements & Notes',
    defaultSelected: true,
    getValue: (o) => o.adminNotes || '',
  },
  {
    id: 'privateNotes',
    label: 'Internal Staff Notes',
    category: 'Requirements & Notes',
    defaultSelected: true,
    getValue: (o) => o.privateNotes || '',
  },
];

interface AdminOrderExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allOrders: OrderRequest[];
  filteredOrders: OrderRequest[];
  activeOrder?: OrderRequest;
  activeFilterStatus: string;
  activeFilterPriority: string;
}

export const AdminOrderExportModal: React.FC<AdminOrderExportModalProps> = ({
  isOpen,
  onClose,
  allOrders,
  filteredOrders,
  activeOrder,
  activeFilterStatus,
  activeFilterPriority,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [scope, setScope] = useState<ExportScope>(
    filteredOrders.length < allOrders.length ? 'filtered' : 'all'
  );
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(() =>
    EXPORT_FIELD_DEFINITIONS.filter((f) => f.defaultSelected).map((f) => f.id)
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>('');

  if (!isOpen) return null;

  // Determine current dataset to export
  const exportOrdersList: OrderRequest[] =
    scope === 'active' && activeOrder
      ? [activeOrder]
      : scope === 'filtered'
      ? filteredOrders
      : allOrders;

  // Calculate summary metrics for export preview
  let totalRevenueBDT = 0;
  let highPriorityCount = 0;
  let completedCount = 0;

  exportOrdersList.forEach((ord) => {
    const priceRaw = ord.price || ord.budget || '৳0';
    let num = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;
    if (priceRaw.includes('$')) num *= 120;
    totalRevenueBDT += num;

    if (ord.priority?.toLowerCase() === 'high') highPriorityCount++;
    if (ord.status === 'COMPLETED' || ord.status === 'ACCEPTED') completedCount++;
  });

  const handleToggleField = (fieldId: string) => {
    setSelectedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const handleSelectAllFields = () => {
    setSelectedFieldIds(EXPORT_FIELD_DEFINITIONS.map((f) => f.id));
  };

  const handleResetDefaultFields = () => {
    setSelectedFieldIds(
      EXPORT_FIELD_DEFINITIONS.filter((f) => f.defaultSelected).map((f) => f.id)
    );
  };

  const executeExport = () => {
    if (exportOrdersList.length === 0) {
      alert('No orders available to export.');
      return;
    }
    if (selectedFieldIds.length === 0) {
      alert('Please select at least one field column to export.');
      return;
    }

    setIsExporting(true);

    try {
      const activeFields = EXPORT_FIELD_DEFINITIONS.filter((f) =>
        selectedFieldIds.includes(f.id)
      );

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const defaultPrefix =
        scope === 'active'
          ? `WorkHub_Order_${activeOrder?.id || 'Single'}`
          : scope === 'filtered'
          ? `WorkHub_Orders_Filtered_${activeFilterStatus}_${activeFilterPriority}`
          : 'WorkHub_All_Orders_Database';

      const finalFileName = (customFileName.trim() || `${defaultPrefix}_${timestamp}`).replace(
        /\.[^/.]+$/,
        ''
      );

      if (format === 'csv') {
        // --- CSV GENERATION (UTF-8 with BOM) ---
        const escapeCSV = (val: any) => {
          if (val === null || val === undefined) return '""';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        };

        const headerLine = activeFields.map((f) => escapeCSV(f.label)).join(',');
        const rowLines = exportOrdersList.map((order) =>
          activeFields.map((f) => escapeCSV(f.getValue(order))).join(',')
        );

        const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${finalFileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // --- EXCEL SPREADSHEET (HTML Table Format with Native Excel Styles) ---
        const tableHeaders = activeFields
          .map(
            (f) =>
              `<th style="background-color: #0f172a; color: #38bdf8; font-weight: bold; border: 1px solid #334155; padding: 10px; text-align: left; font-family: Arial, sans-serif; font-size: 12px;">${f.label}</th>`
          )
          .join('');

        const tableRows = exportOrdersList
          .map((order, idx) => {
            const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            const cells = activeFields
              .map((f) => {
                const val = f.getValue(order);
                let style = `background-color: ${rowBg}; border: 1px solid #e2e8f0; padding: 8px 10px; font-family: Arial, sans-serif; font-size: 11px; vertical-align: top;`;
                
                // Colorize status and priority
                if (f.id === 'priority') {
                  const p = String(val).toLowerCase();
                  if (p === 'high') {
                    style += ' color: #dc2626; font-weight: bold; background-color: #fee2e2;';
                  } else if (p === 'medium') {
                    style += ' color: #d97706; font-weight: bold; background-color: #fef3c7;';
                  } else {
                    style += ' color: #475569;';
                  }
                } else if (f.id === 'status') {
                  const s = String(val).toUpperCase();
                  if (s === 'COMPLETED' || s === 'ACCEPTED') {
                    style += ' color: #16a34a; font-weight: bold; background-color: #dcfce7;';
                  } else if (s === 'ADMIN_REVIEW' || s === 'DISCUSSION') {
                    style += ' color: #d97706; font-weight: bold; background-color: #fef3c7;';
                  } else {
                    style += ' color: #2563eb; font-weight: bold; background-color: #dbeafe;';
                  }
                } else if (f.id === 'price' || f.id === 'budget') {
                  style += ' font-weight: bold; color: #0284c7; text-align: right;';
                }

                // Escape html
                const safeVal = String(val)
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/\n/g, '<br/>');

                return `<td style="${style}">${safeVal}</td>`;
              })
              .join('');

            return `<tr>${cells}</tr>`;
          })
          .join('');

        const excelHTML = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:x="urn:schemas-microsoft-com:office:excel"
                xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>Orders Report</x:Name>
                    <x:WorksheetOptions>
                      <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
              body { font-family: Calibri, Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; }
            </style>
          </head>
          <body>
            <div style="margin-bottom: 16px;">
              <h2 style="color: #0f172a; margin-bottom: 4px; font-family: Arial, sans-serif;">WorkHub Digital Services - Orders Report</h2>
              <p style="color: #64748b; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
                Generated on: <strong>${new Date().toLocaleString()}</strong> | Scope: <strong>${scope.toUpperCase()}</strong> | Records: <strong>${exportOrdersList.length}</strong> | Total Value: <strong>৳${Math.round(totalRevenueBDT).toLocaleString()}</strong>
              </p>
            </div>
            <table>
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const blob = new Blob([excelHTML], {
          type: 'application/vnd.ms-excel;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${finalFileName}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      onClose();
    } catch (err) {
      console.error('Export execution failed:', err);
      alert('Error during export. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const categories = ['Core', 'Client', 'Financial & Timeline', 'Requirements & Notes'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs text-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Export Orders Report</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  CSV & Excel
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate clean, structured spreadsheets for accounting, client reporting, and task tracking.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Format & Scope Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Format Picker */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Table className="h-3 w-3 text-cyan-400" />
                <span>1. Select Export Format</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    format === 'csv'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white flex items-center justify-between">
                    <span>CSV (.csv)</span>
                    {format === 'csv' && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Standard comma-separated format with UTF-8 BOM.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    format === 'excel'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-extrabold text-xs text-white flex items-center justify-between">
                    <span>Excel (.xls)</span>
                    {format === 'excel' && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Stylized spreadsheet table with custom headers & status badges.
                  </p>
                </button>
              </div>
            </div>

            {/* Scope Picker */}
            <div className="space-y-2">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-cyan-400" />
                <span>2. Select Order Dataset Scope</span>
              </label>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setScope('filtered')}
                  className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    scope === 'filtered'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-bold text-white text-xs">Current Filtered View</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Matches: Status "{activeFilterStatus}" & Priority "{activeFilterPriority}"
                    </span>
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[11px] shrink-0 ml-2">
                    {filteredOrders.length} orders
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    scope === 'all'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white text-xs">All Orders Database</span>
                    <span className="text-[10px] text-slate-400 block">
                      Entire repository without active filter restrictions
                    </span>
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] shrink-0 ml-2">
                    {allOrders.length} orders
                  </span>
                </button>

                {activeOrder && (
                  <button
                    type="button"
                    onClick={() => setScope('active')}
                    className={`w-full px-3 py-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      scope === 'active'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold text-white text-xs">Selected Order Only ({activeOrder.id})</span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {activeOrder.clientName} - {activeOrder.serviceTitle}
                      </span>
                    </div>
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[11px] shrink-0 ml-2">
                      1 order
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Data Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Export Batch Summary</span>
                <div className="font-black text-white text-sm">
                  {exportOrdersList.length} Order(s) selected for export
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-sans block">Total Batch Value</span>
                <span className="font-bold text-cyan-400">৳{Math.round(totalRevenueBDT).toLocaleString()}</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 font-sans block">High Priority</span>
                <span className="font-bold text-rose-400">{highPriorityCount}</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 font-sans block">Fulfilled / Done</span>
                <span className="font-bold text-emerald-400">{completedCount}</span>
              </div>
            </div>
          </div>

          {/* Field Columns Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-cyan-400" />
                <span>3. Customize Export Columns ({selectedFieldIds.length}/{EXPORT_FIELD_DEFINITIONS.length} selected)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllFields}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleResetDefaultFields}
                  className="text-slate-400 hover:text-white text-[11px] font-semibold cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {categories.map((cat) => {
                const catFields = EXPORT_FIELD_DEFINITIONS.filter((f) => f.category === cat);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {cat}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {catFields.map((field) => {
                        const isChecked = selectedFieldIds.includes(field.id);
                        return (
                          <label
                            key={field.id}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleField(field.id)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                            />
                            <span className="font-semibold text-xs truncate">{field.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Custom File Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
              Optional Custom File Name
            </label>
            <input
              type="text"
              placeholder={`WorkHub_Orders_${new Date().toISOString().split('T')[0]}`}
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={executeExport}
              disabled={isExporting || exportOrdersList.length === 0}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                format === 'excel'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Download className="h-4 w-4" />
              <span>
                {format === 'excel' ? 'Download Excel (.xls)' : 'Download CSV (.csv)'} (
                {exportOrdersList.length})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
