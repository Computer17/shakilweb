import React, { useState } from 'react';
import { OrderRequest, OrderStatus, OrderPriority } from '../../types';
import { OrderTimeline } from '../common/OrderTimeline';
import { AdminOrderExportModal } from './AdminOrderExportModal';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  DollarSign,
  FileText,
  Send,
  Upload,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Download,
  FileSpreadsheet,
  Check,
  Flame,
  AlertTriangle,
  ArrowUpDown,
  Zap,
  Filter,
  Lock,
  ShieldAlert,
  StickyNote,
  Save,
  Sparkles,
  Reply,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCheck,
  FileDown,
  SlidersHorizontal,
  Mail,
  FolderOpen,
} from 'lucide-react';

interface QuickReplyTemplate {
  id: string;
  category: 'All' | 'Status Updates' | 'Onboarding' | 'Clarifications' | 'Completion' | 'Pricing';
  label: string;
  shortSnippet: string;
  icon?: string;
  text: (order: OrderRequest) => string;
  badgeColor: string;
}

const QUICK_REPLY_TEMPLATES: QuickReplyTemplate[] = [
  {
    id: 'ack-start',
    category: 'Onboarding',
    label: 'Order Acknowledged & Started',
    shortSnippet: 'Files received and scheduled for active processing...',
    icon: '🚀',
    text: (order) =>
      `Hello ${order.clientName}, we have received your files for "${order.serviceTitle}" and our specialist team has commenced work. We will keep you updated with progress!`,
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'status-ontrack',
    category: 'Status Updates',
    label: 'Progress Update: On Schedule',
    shortSnippet: 'Task is on track for delivery on time...',
    icon: '⏳',
    text: (order) =>
      `Hi ${order.clientName}, our team is actively processing your order. Everything is proceeding smoothly and on schedule for delivery within ${
        order.estimatedCompletion || order.requestedDelivery || 'the agreed turnaround'
      }.`,
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'qa-review',
    category: 'Status Updates',
    label: 'Final Quality Check Underway',
    shortSnippet: 'Undergoing quality inspection before release...',
    icon: '🔍',
    text: (order) =>
      `Hello ${order.clientName}, your deliverables have been prepared and are currently undergoing our senior quality assurance inspection to verify accuracy before delivery.`,
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'need-clarification',
    category: 'Clarifications',
    label: 'Request Details & Source Files',
    shortSnippet: 'Request higher resolution files or exact specs...',
    icon: '📎',
    text: (order) =>
      `Hi ${order.clientName}, could you please provide a few more details or higher-resolution source files for your task? This will help us ensure 100% precision with your requirements.`,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'order-complete',
    category: 'Completion',
    label: 'Order Delivered & Completed',
    shortSnippet: 'All deliverables ready for client review...',
    icon: '🎉',
    text: (order) =>
      `Hello ${order.clientName}, your order for "${order.serviceTitle}" is complete! All finalized deliverables have been prepared. Please inspect and let us know if you need any adjustments. Thank you for choosing WorkHub!`,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'express-rush',
    category: 'Status Updates',
    label: 'Urgent / Rush Priority Assigned',
    shortSnippet: 'Expedited processing queue active...',
    icon: '⚡',
    text: (order) =>
      `Hello ${order.clientName}, your order has been flagged for High Priority expedited turnaround. A senior specialist is handling your request immediately.`,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'pricing-quote',
    category: 'Pricing',
    label: 'Price Quote & Payment Confirmation',
    shortSnippet: 'Confirmed price and invoice breakdown...',
    icon: '💳',
    text: (order) =>
      `Hi ${order.clientName}, we have confirmed the pricing for this order at ${
        order.price || order.budget || 'the discussed rate'
      }. Please let us know if you need an official invoice or receipt.`,
    badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  },
];

interface AdminOrdersManagerProps {
  orders: OrderRequest[];
  onUpdateOrder: (
    orderId: string,
    updates: {
      status?: OrderStatus;
      priority?: OrderPriority;
      price?: string;
      estimatedCompletion?: string;
      adminNotes?: string;
      privateNotes?: string;
    }
  ) => void;
  onSendMessage: (orderId: string, text: string) => void;
  selectedOrderId?: string;
  onOpenWorkspace?: (tab: 'drive' | 'gmail' | 'chat', orderContext?: any) => void;
}

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({
  orders,
  onUpdateOrder,
  onSendMessage,
  selectedOrderId,
  onOpenWorkspace,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortByPriorityHighFirst, setSortByPriorityHighFirst] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || orders[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [actionNotificationMsg, setActionNotificationMsg] = useState<string | null>(null);

  // Editable price & delivery inputs for currently active order
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const [editPrice, setEditPrice] = useState(activeOrder?.price || '');
  const [editDelivery, setEditDelivery] = useState(activeOrder?.estimatedCompletion || '');
  const [editNotes, setEditNotes] = useState(activeOrder?.adminNotes || '');
  const [editPrivateNotes, setEditPrivateNotes] = useState(activeOrder?.privateNotes || '');
  const [privateNotesSavedNotice, setPrivateNotesSavedNotice] = useState<boolean>(false);
  const [priceSavedNotice, setPriceSavedNotice] = useState<boolean>(false);
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState<boolean>(false);
  const [quickReplyCategory, setQuickReplyCategory] = useState<string>('All');
  const [quickReplySearch, setQuickReplySearch] = useState<string>('');
  const [quickReplyNotice, setQuickReplyNotice] = useState<string | null>(null);

  // Synchronize edit inputs when activeOrder selection or properties change
  React.useEffect(() => {
    if (activeOrder) {
      setEditPrice(activeOrder.price || '');
      setEditDelivery(activeOrder.estimatedCompletion || '');
      setEditNotes(activeOrder.adminNotes || '');
      setEditPrivateNotes(activeOrder.privateNotes || '');
    }
  }, [activeOrder?.id, activeOrder?.privateNotes, activeOrder?.price, activeOrder?.estimatedCompletion, activeOrder?.adminNotes]);

  // Helper to normalize priority
  const getNormalizedPriority = (priority?: string): 'High' | 'Medium' | 'Low' => {
    if (!priority) return 'Medium';
    const p = priority.toLowerCase();
    if (p === 'high') return 'High';
    if (p === 'low') return 'Low';
    return 'Medium';
  };

  // Priority counts for triage dashboard
  const highPriorityCount = orders.filter((o) => getNormalizedPriority(o.priority) === 'High').length;
  const mediumPriorityCount = orders.filter((o) => getNormalizedPriority(o.priority) === 'Medium').length;
  const lowPriorityCount = orders.filter((o) => getNormalizedPriority(o.priority) === 'Low').length;

  const filteredOrders = orders
    .filter((o) => {
      const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
      const matchPriority = filterPriority === 'ALL' || getNormalizedPriority(o.priority) === filterPriority;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        (o.clientPhone && o.clientPhone.toLowerCase().includes(q)) ||
        (o.clientEmail && o.clientEmail.toLowerCase().includes(q)) ||
        o.serviceTitle.toLowerCase().includes(q) ||
        (o.requirements && o.requirements.toLowerCase().includes(q)) ||
        (o.adminNotes && o.adminNotes.toLowerCase().includes(q)) ||
        (o.privateNotes && o.privateNotes.toLowerCase().includes(q));

      return matchStatus && matchPriority && matchSearch;
    })
    .sort((a, b) => {
      if (!sortByPriorityHighFirst) return 0;
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      const weightA = priorityWeight[getNormalizedPriority(a.priority)];
      const weightB = priorityWeight[getNormalizedPriority(b.priority)];
      return weightB - weightA;
    });

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!activeOrder) return;
    onUpdateOrder(activeOrder.id, {
      status: newStatus,
      priority: activeOrder.priority || 'Medium',
      price: editPrice || activeOrder.price,
      estimatedCompletion: editDelivery || activeOrder.estimatedCompletion,
      adminNotes: editNotes,
      privateNotes: editPrivateNotes || activeOrder.privateNotes,
    });

    if (newStatus === 'ACCEPTED') {
      setActionNotificationMsg(`✓ Order ${activeOrder.id} APPROVED & ACCEPTED! Client ${activeOrder.clientName} has been notified in real-time.`);
    } else if (newStatus === 'REJECTED') {
      setActionNotificationMsg(`⚠️ Order ${activeOrder.id} REJECTED. Rejection notification & guidance dispatched to client.`);
    } else if (newStatus === 'COMPLETED') {
      setActionNotificationMsg(`🎉 Order ${activeOrder.id} marked COMPLETED! Deliverable notification dispatched to ${activeOrder.clientName}.`);
    } else {
      setActionNotificationMsg(`✓ Status updated to "${newStatus.replace(/_/g, ' ')}" and client notified.`);
    }

    setTimeout(() => {
      setActionNotificationMsg(null);
    }, 5000);
  };

  const handleSavePriceAndDelivery = () => {
    if (!activeOrder) return;
    onUpdateOrder(activeOrder.id, {
      status: activeOrder.status,
      priority: activeOrder.priority || 'Medium',
      price: editPrice,
      estimatedCompletion: editDelivery,
      adminNotes: editNotes,
      privateNotes: editPrivateNotes || activeOrder.privateNotes,
    });
    setPriceSavedNotice(true);
    setActionNotificationMsg(`💰 Price (${editPrice || 'N/A'}) & Delivery (${editDelivery || 'N/A'}) saved and proposed to ${activeOrder.clientName}!`);
    setTimeout(() => {
      setPriceSavedNotice(false);
      setActionNotificationMsg(null);
    }, 4000);
  };

  const handlePriorityChange = (newPriority: OrderPriority) => {
    if (!activeOrder) return;
    onUpdateOrder(activeOrder.id, {
      priority: newPriority,
      status: activeOrder.status,
      price: editPrice || activeOrder.price,
      estimatedCompletion: editDelivery || activeOrder.estimatedCompletion,
      adminNotes: editNotes,
      privateNotes: editPrivateNotes || activeOrder.privateNotes,
    });
  };

  const handleSavePrivateNotes = () => {
    if (!activeOrder) return;
    onUpdateOrder(activeOrder.id, {
      privateNotes: editPrivateNotes,
      status: activeOrder.status,
      priority: activeOrder.priority || 'Medium',
      price: editPrice || activeOrder.price,
      estimatedCompletion: editDelivery || activeOrder.estimatedCompletion,
      adminNotes: editNotes,
    });
    setPrivateNotesSavedNotice(true);
    setTimeout(() => {
      setPrivateNotesSavedNotice(false);
    }, 3000);
  };

  const handleAppendNoteTag = (tagType: 'timestamp' | 'qa' | 'assignee' | 'urgent') => {
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let insertion = '';
    if (tagType === 'timestamp') {
      insertion = `[${nowStr}]: `;
    } else if (tagType === 'qa') {
      insertion = `\n[QA Checklist]: ✅ Data format checked | ✅ Target output aligned | Ready`;
    } else if (tagType === 'assignee') {
      insertion = `\n[Staff Assignment]: Lead Specialist Tariq / Shakil`;
    } else if (tagType === 'urgent') {
      insertion = `\n⚠️ [URGENT ATTENTION REQUIRED]: `;
    }

    setEditPrivateNotes((prev) => (prev ? `${prev.trimEnd()} ${insertion}` : insertion));
  };

  const handleSendAdminMessage = () => {
    if (!replyText.trim() || !activeOrder) return;
    onSendMessage(activeOrder.id, replyText);
    setReplyText('');
  };

  const handleSelectQuickReply = (template: QuickReplyTemplate, sendImmediately: boolean = false) => {
    if (!activeOrder) return;
    const generatedText = template.text(activeOrder);

    if (sendImmediately) {
      onSendMessage(activeOrder.id, generatedText);
      setQuickReplyNotice(`Sent: "${template.label}"`);
      setTimeout(() => setQuickReplyNotice(null), 3000);
    } else {
      setReplyText(generatedText);
      setQuickReplyNotice(`Inserted: "${template.label}"`);
      setTimeout(() => setQuickReplyNotice(null), 3000);
    }
  };

  const filteredQuickReplies = QUICK_REPLY_TEMPLATES.filter((tpl) => {
    const matchCategory = quickReplyCategory === 'All' || tpl.category === quickReplyCategory;
    const searchLower = quickReplySearch.toLowerCase().trim();
    const matchSearch =
      !searchLower ||
      tpl.label.toLowerCase().includes(searchLower) ||
      tpl.shortSnippet.toLowerCase().includes(searchLower) ||
      tpl.category.toLowerCase().includes(searchLower);
    return matchCategory && matchSearch;
  });

  // Priority Indicator Pill Component
  const renderPriorityBadge = (priority?: string, compact: boolean = false) => {
    const p = getNormalizedPriority(priority);
    if (p === 'High') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-extrabold rounded-md uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
          }`}
          title="High Priority: Urgent deadline or high complexity"
        >
          <Flame className={`${compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} text-rose-400 fill-rose-400`} />
          <span>High</span>
        </span>
      );
    }
    if (p === 'Low') {
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-md uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700 ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
          }`}
          title="Low Priority: Flexible delivery timeline"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span>Low</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 font-bold rounded-md uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 ${
          compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
        }`}
        title="Medium Priority: Standard turnaround"
      >
        <AlertTriangle className={`${compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} text-amber-400`} />
        <span>Medium</span>
      </span>
    );
  };

  // CSV Export Logic
  const handleExportCSV = (scope: 'all' | 'filtered' | 'active') => {
    let dataToExport: OrderRequest[] = [];
    let filePrefix = 'Orders_Export';

    if (scope === 'active' && activeOrder) {
      dataToExport = [activeOrder];
      filePrefix = `Order_${activeOrder.id}_Export`;
    } else if (scope === 'filtered') {
      dataToExport = filteredOrders;
      filePrefix = `Orders_${filterStatus}_${filterPriority}_Export`;
    } else {
      dataToExport = orders;
      filePrefix = 'All_Orders_Export';
    }

    if (dataToExport.length === 0) {
      alert('No orders available to export.');
      return;
    }

    setIsExporting(true);

    try {
      const headers = [
        'Order ID',
        'Priority',
        'Status',
        'Client Name',
        'Client Phone',
        'Client Email',
        'Contact Platform',
        'Service Title',
        'Initial Budget',
        'Agreed Price',
        'Requested Delivery',
        'Estimated Completion',
        'Task Requirements',
        'Attached Files Count',
        'Attached Files List',
        'Created Date',
        'Updated Date',
        'Email Alerts Subscribed',
        'Client Rating',
        'Client Review Comment',
        'Admin Notes',
        'Internal Private Notes',
      ];

      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return '""';
        const stringVal = String(value).replace(/"/g, '""');
        return `"${stringVal}"`;
      };

      const rows = dataToExport.map((ord) => {
        const fileNames = ord.files?.map((f) => f.name).join('; ') || 'None';
        return [
          escapeCSV(ord.id),
          escapeCSV(getNormalizedPriority(ord.priority)),
          escapeCSV(ord.status),
          escapeCSV(ord.clientName),
          escapeCSV(ord.clientPhone || ''),
          escapeCSV(ord.clientEmail || ''),
          escapeCSV(ord.contactPlatform || 'whatsapp'),
          escapeCSV(ord.serviceTitle),
          escapeCSV(ord.budget || ''),
          escapeCSV(ord.price || ''),
          escapeCSV(ord.requestedDelivery || ''),
          escapeCSV(ord.estimatedCompletion || ''),
          escapeCSV(ord.requirements || ''),
          escapeCSV(ord.files?.length || ord.fileCount || 0),
          escapeCSV(fileNames),
          escapeCSV(ord.createdAt),
          escapeCSV(ord.updatedAt || ord.createdAt),
          escapeCSV(ord.emailSubscribed ? 'YES' : 'NO'),
          escapeCSV(ord.review ? `${ord.review.rating}/5` : 'N/A'),
          escapeCSV(ord.review?.comment || ''),
          escapeCSV(ord.adminNotes || ''),
          escapeCSV(ord.privateNotes || ''),
        ].join(',');
      });

      // UTF-8 BOM + Headers + CSV Lines
      const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filePrefix}_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessMsg(`Exported ${dataToExport.length} order(s) to CSV!`);
      setTimeout(() => {
        setExportSuccessMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Error generating CSV file export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Excel (.xls) Export Logic
  const handleExportExcel = (scope: 'all' | 'filtered' | 'active') => {
    let dataToExport: OrderRequest[] = [];
    let filePrefix = 'WorkHub_Orders_Report';

    if (scope === 'active' && activeOrder) {
      dataToExport = [activeOrder];
      filePrefix = `WorkHub_Order_${activeOrder.id}`;
    } else if (scope === 'filtered') {
      dataToExport = filteredOrders;
      filePrefix = `WorkHub_Orders_${filterStatus}_${filterPriority}`;
    } else {
      dataToExport = orders;
      filePrefix = 'WorkHub_All_Orders_Database';
    }

    if (dataToExport.length === 0) {
      alert('No orders available to export.');
      return;
    }

    setIsExporting(true);

    try {
      const headers = [
        'Order ID',
        'Priority',
        'Status',
        'Client Name',
        'Phone',
        'Email',
        'Service Title',
        'Budget',
        'Agreed Price',
        'Requested Delivery',
        'Confirmed Delivery',
        'Requirements',
        'Attached Files',
        'Created Date',
        'Admin Notes',
        'Private Notes',
      ];

      const tableHeaders = headers
        .map(
          (h) =>
            `<th style="background-color: #0f172a; color: #38bdf8; font-weight: bold; border: 1px solid #334155; padding: 10px; text-align: left; font-family: Arial, sans-serif; font-size: 12px;">${h}</th>`
        )
        .join('');

      const tableRows = dataToExport
        .map((ord, idx) => {
          const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          const fileNames = ord.files?.map((f) => f.name).join('; ') || 'None';
          const priority = getNormalizedPriority(ord.priority);
          const priorityColor =
            priority === 'High' ? '#dc2626; font-weight: bold; background-color: #fee2e2;' : priority === 'Medium' ? '#d97706; font-weight: bold; background-color: #fef3c7;' : '#475569;';

          const statusColor =
            ord.status === 'COMPLETED' || ord.status === 'ACCEPTED'
              ? '#16a34a; font-weight: bold; background-color: #dcfce7;'
              : ord.status === 'ADMIN_REVIEW'
              ? '#d97706; font-weight: bold; background-color: #fef3c7;'
              : '#2563eb; font-weight: bold; background-color: #dbeafe;';

          const formatCell = (val: any, extraStyle = '') => {
            const safe = String(val ?? '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br/>');
            return `<td style="background-color: ${rowBg}; border: 1px solid #e2e8f0; padding: 8px 10px; font-family: Arial, sans-serif; font-size: 11px; vertical-align: top; ${extraStyle}">${safe}</td>`;
          };

          return `<tr>
            ${formatCell(ord.id, 'font-weight: bold; color: #0284c7;')}
            ${formatCell(priority, `color: ${priorityColor}`)}
            ${formatCell(ord.status, `color: ${statusColor}`)}
            ${formatCell(ord.clientName, 'font-weight: 600;')}
            ${formatCell(ord.clientPhone || '')}
            ${formatCell(ord.clientEmail || '')}
            ${formatCell(ord.serviceTitle)}
            ${formatCell(ord.budget || '', 'text-align: right;')}
            ${formatCell(ord.price || ord.budget || '', 'font-weight: bold; color: #0284c7; text-align: right;')}
            ${formatCell(ord.requestedDelivery || '')}
            ${formatCell(ord.estimatedCompletion || ord.requestedDelivery || '')}
            ${formatCell(ord.requirements || '')}
            ${formatCell(fileNames)}
            ${formatCell(ord.createdAt)}
            ${formatCell(ord.adminNotes || '')}
            ${formatCell(ord.privateNotes || '')}
          </tr>`;
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
                  <x:Name>WorkHub Orders</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body style="font-family: Calibri, Arial, sans-serif;">
          <div style="margin-bottom: 16px;">
            <h2 style="color: #0f172a; margin-bottom: 4px; font-family: Arial, sans-serif;">WorkHub Digital Services - Orders Manager Export</h2>
            <p style="color: #64748b; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
              Export Date: <strong>${new Date().toLocaleString()}</strong> | Scope: <strong>${scope.toUpperCase()}</strong> | Total Records: <strong>${dataToExport.length}</strong>
            </p>
          </div>
          <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filePrefix}_${timestamp}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessMsg(`Exported ${dataToExport.length} order(s) to Excel!`);
      setTimeout(() => {
        setExportSuccessMsg(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('Error generating Excel spreadsheet.');
    } finally {
      setIsExporting(false);
    }
  };

  const statuses: { label: string; value: string }[] = [
    { label: 'All Requests', value: 'ALL' },
    { label: 'Admin Review', value: 'ADMIN_REVIEW' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Discussion', value: 'DISCUSSION' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Orders OS Management</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              {orders.length} Total
            </span>
            {filteredOrders.length !== orders.length && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                {filteredOrders.length} Match
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">
            Triage order requests by Priority, update statuses, manage pricing, export CSV/Excel reports, and communicate with clients.
          </p>
        </div>

        {/* Action Buttons: Export Suite */}
        <div className="flex flex-wrap items-center gap-2">
          {exportSuccessMsg && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
              <Check className="h-3.5 w-3.5" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-md">
            {/* Quick CSV Export */}
            <button
              type="button"
              onClick={() => handleExportCSV(filteredOrders.length < orders.length ? 'filtered' : 'all')}
              disabled={isExporting || orders.length === 0}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/20 disabled:opacity-50"
              title="Quick export order list as CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>CSV ({filteredOrders.length})</span>
            </button>

            {/* Quick Excel Export */}
            <button
              type="button"
              onClick={() => handleExportExcel(filteredOrders.length < orders.length ? 'filtered' : 'all')}
              disabled={isExporting || orders.length === 0}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-50"
              title="Quick export order list as Excel Spreadsheet"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Excel (.xls)</span>
            </button>

            {/* Custom Report & Columns Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Open full export configuration and column selector"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
              <span>Custom Export...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Priority Triage Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setFilterPriority(filterPriority === 'High' ? 'ALL' : 'High')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterPriority === 'High'
              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="h-4 w-4 fill-rose-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">High Priority</span>
              <p className="text-[10px] text-slate-400">Urgent delivery & complex</p>
            </div>
          </div>
          <span className="text-lg font-black font-mono text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
            {highPriorityCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterPriority(filterPriority === 'Medium' ? 'ALL' : 'Medium')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterPriority === 'Medium'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Medium Priority</span>
              <p className="text-[10px] text-slate-400">Standard queue fulfillment</p>
            </div>
          </div>
          <span className="text-lg font-black font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
            {mediumPriorityCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterPriority(filterPriority === 'Low' ? 'ALL' : 'Low')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            filterPriority === 'Low'
              ? 'bg-slate-800/80 border-cyan-500 ring-1 ring-cyan-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Low Priority</span>
              <p className="text-[10px] text-slate-400">Flexible timeline</p>
            </div>
          </div>
          <span className="text-lg font-black font-mono text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
            {lowPriorityCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setFilterStatus(st.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === st.value
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Priority Filter & Sort & Search Toggles */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Live Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search orders, client, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 font-semibold px-2 flex items-center gap-1">
              <Filter className="h-3 w-3 text-cyan-400" />
              <span>Priority:</span>
            </span>
            {(['ALL', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterPriority(p)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterPriority === p
                    ? p === 'High'
                      ? 'bg-rose-500 text-white'
                      : p === 'Medium'
                      ? 'bg-amber-500 text-slate-950'
                      : p === 'Low'
                      ? 'bg-slate-700 text-white'
                      : 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Sort High-First Toggle */}
          <button
            type="button"
            onClick={() => setSortByPriorityHighFirst((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              sortByPriorityHighFirst
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Sort orders with High Priority first"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>High First</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filteredOrders.map((ord) => {
            const isSelected = activeOrder?.id === ord.id;
            const normPriority = getNormalizedPriority(ord.priority);
            const isHigh = normPriority === 'High';

            return (
              <div
                key={ord.id}
                onClick={() => {
                  setActiveOrderId(ord.id);
                  setEditPrice(ord.price || '');
                  setEditDelivery(ord.estimatedCompletion || '');
                  setEditNotes(ord.adminNotes || '');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                    : isHigh
                    ? 'border-rose-500/40 bg-slate-900/80 hover:border-rose-500/70'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Visual Left Accent for High Priority */}
                {isHigh && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-cyan-400">{ord.id}</span>
                    {renderPriorityBadge(ord.priority, true)}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ord.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : ord.status === 'ADMIN_REVIEW'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="font-bold text-sm text-white">{ord.clientName}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{ord.serviceTitle}</div>

                {ord.privateNotes?.trim() && (
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-medium">
                    <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="truncate">Private Note: {ord.privateNotes.slice(0, 45)}...</span>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Files: {ord.fileCount}</span>
                  <span className="font-semibold text-slate-300">{ord.price || ord.budget}</span>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
              No orders match status "{filterStatus}" and priority "{filterPriority}".
            </div>
          )}
        </div>

        {/* Right Column: Selected Order Active Details & Actions */}
        {activeOrder ? (
          <div className="lg:col-span-2 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl font-extrabold text-cyan-400">{activeOrder.id}</span>
                  {renderPriorityBadge(activeOrder.priority, false)}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeOrder.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Submitted: {activeOrder.createdAt}</p>
              </div>

              {/* Quick Status Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCSV('active')}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Export this single order to CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export Order</span>
                </button>
                {onOpenWorkspace && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenWorkspace('gmail', {
                        orderId: activeOrder.id,
                        serviceTitle: activeOrder.serviceTitle,
                        clientName: activeOrder.clientName,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Send Gmail update to client"
                  >
                    <Mail className="h-3.5 w-3.5 text-red-400" />
                    <span>Gmail Client</span>
                  </button>
                )}
                {onOpenWorkspace && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenWorkspace('drive', {
                        orderId: activeOrder.id,
                        serviceTitle: activeOrder.serviceTitle,
                        clientName: activeOrder.clientName,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Upload deliverable or receipt to Google Drive"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Save to Drive</span>
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('ADMIN_REVIEW')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 cursor-pointer"
                >
                  In Review
                </button>
                <button
                  onClick={() => handleStatusChange('ACCEPTED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Accept & Notify ✓
                </button>
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 cursor-pointer"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Completed ✅
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-500/30 cursor-pointer"
                >
                  Reject & Alert
                </button>
              </div>
            </div>

            {/* Live Client Notification Confirmation Banner */}
            {actionNotificationMsg && (
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 text-xs text-cyan-200 flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold">{actionNotificationMsg}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                  Client Alert Dispatched
                </span>
              </div>
            )}

            {/* Priority Triage Selector Section */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Priority Triage Level:</span>
                  <span className="text-[10px] text-slate-400">
                    Update task urgency to prioritize queue execution
                  </span>
                </div>
              </div>

              {/* 1-Click Priority Switcher Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handlePriorityChange('Low')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    getNormalizedPriority(activeOrder.priority) === 'Low'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Low</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePriorityChange('Medium')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    getNormalizedPriority(activeOrder.priority) === 'Medium'
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Medium</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePriorityChange('High')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    getNormalizedPriority(activeOrder.priority) === 'High'
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <Flame className="h-3 w-3 fill-white" />
                  <span>High (Urgent)</span>
                </button>
              </div>
            </div>

            {/* Live Visual Timeline Progress Bar */}
            <OrderTimeline
              status={activeOrder.status}
              orderId={activeOrder.id}
              serviceTitle={activeOrder.serviceTitle}
              estimatedCompletion={activeOrder.estimatedCompletion || activeOrder.requestedDelivery}
            />

            {/* Client Info & Scope */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 font-semibold block">Client Info:</span>
                  {activeOrder.emailSubscribed ? (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                      <span>📧 Email Alerts ON</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400">
                      <span>🔕 Email Alerts Off</span>
                    </span>
                  )}
                </div>
                <p className="font-bold text-white text-sm">{activeOrder.clientName}</p>
                <p className="text-slate-300">{activeOrder.clientPhone || activeOrder.clientEmail || 'WhatsApp'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Service & Urgency:</span>
                <p className="font-bold text-cyan-400 text-sm">{activeOrder.serviceTitle}</p>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-300">Requested: {activeOrder.requestedDelivery}</span>
                  {renderPriorityBadge(activeOrder.priority, true)}
                </div>
              </div>
            </div>

            {/* Client Review if Submitted */}
            {activeOrder.review && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <span>⭐ Client Review ({activeOrder.review.rating}/5 Stars):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{activeOrder.review.submittedAt}</span>
                </div>
                <p className="text-slate-200 italic pl-2 border-l-2 border-amber-500/50">
                  "{activeOrder.review.comment}"
                </p>
              </div>
            )}

            {/* Task Requirements */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-300">Task Requirements:</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed">
                {activeOrder.requirements}
              </div>
            </div>

            {/* Uploaded Files */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300">Attached Documents ({activeOrder.files?.length || 0}):</span>
              {activeOrder.files && activeOrder.files.length > 0 ? (
                <div className="space-y-2">
                  {activeOrder.files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{f.name}</span>
                      </div>
                      <a
                        href={f.url}
                        download
                        className="text-cyan-400 hover:underline font-semibold text-[11px] shrink-0"
                      >
                        Download File
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No files attached to this request.</p>
              )}
            </div>

            {/* Admin Controls: Set Price, Delivery & Public Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Set Agreed Price:</label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="e.g. ৳800"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Set Delivery Time:</label>
                <input
                  type="text"
                  value={editDelivery}
                  onChange={(e) => setEditDelivery(e.target.value)}
                  placeholder="e.g. 24 Hours"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Save Price & Delivery Proposal Button */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
              <span className="text-[11px] text-slate-400">
                Updating price or delivery triggers an automated client notification proposal.
              </span>
              <button
                type="button"
                onClick={handleSavePriceAndDelivery}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{priceSavedNotice ? '✓ Saved & Dispatched!' : 'Save & Notify Client'}</span>
              </button>
            </div>

            {/* Internal Private Notes (Admin Eyes Only) */}
            <div className="p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950 text-xs space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">Internal Private Notes</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        Admin Eyes Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Stored in the order object and strictly hidden from client tracking.</p>
                  </div>
                </div>

                {/* Quick Insert Snippet Tags */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAppendNoteTag('timestamp')}
                    className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                    title="Insert current timestamp into notes"
                  >
                    + Timestamp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendNoteTag('qa')}
                    className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                    title="Insert QA Checklist snippet"
                  >
                    + QA Check
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendNoteTag('assignee')}
                    className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                    title="Insert Staff Assignment"
                  >
                    + Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAppendNoteTag('urgent')}
                    className="px-2 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                    title="Insert Urgent attention tag"
                  >
                    + Urgent
                  </button>
                </div>
              </div>

              {/* Private Notes Textarea */}
              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  value={editPrivateNotes}
                  onChange={(e) => setEditPrivateNotes(e.target.value)}
                  placeholder="Type confidential staff notes, client special instructions, contractor assignments, profit calculations, QA checklists, or internal drive URLs..."
                  className="w-full rounded-xl border border-amber-500/30 bg-slate-950 p-3 text-slate-200 text-xs focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 focus:outline-none placeholder:text-slate-600 font-mono leading-relaxed"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{editPrivateNotes.length} chars</span>
                    <span>•</span>
                    <span className="text-amber-400/80 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Never visible to client
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {privateNotesSavedNotice && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
                        <Check className="h-3.5 w-3.5" />
                        Saved to Order Object
                      </span>
                    )}

                    {editPrivateNotes && (
                      <button
                        type="button"
                        onClick={() => setEditPrivateNotes('')}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSavePrivateNotes}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-amber-500/20"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Private Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Messages Thread with Quick Replies */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Client Message History & Updates</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-semibold">
                    {activeOrder.messages.length} messages
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuickRepliesOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isQuickRepliesOpen
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-950 text-cyan-400 border-cyan-500/30 hover:bg-cyan-950/40'
                  }`}
                  title="Toggle Quick Replies Library"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Quick Replies</span>
                  {isQuickRepliesOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>

              {/* Expandable Quick Replies Full Library Drawer */}
              {isQuickRepliesOpen && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Reply className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Quick Reply Templates Library</span>
                        <span className="text-[10px] text-slate-400">
                          Select a template to instantly customize or 1-click send to {activeOrder.clientName}
                        </span>
                      </div>
                    </div>

                    {/* Search inside quick replies */}
                    <div className="relative min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search quick replies..."
                        value={quickReplySearch}
                        onChange={(e) => setQuickReplySearch(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {(['All', 'Onboarding', 'Status Updates', 'Clarifications', 'Completion', 'Pricing'] as const).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setQuickReplyCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            quickReplyCategory === cat
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  {/* Quick Replies Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {filteredQuickReplies.map((tpl) => {
                      const previewText = tpl.text(activeOrder);
                      return (
                        <div
                          key={tpl.id}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2 group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                <span>{tpl.icon || '💬'}</span>
                                <span>{tpl.label}</span>
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${tpl.badgeColor}`}
                              >
                                {tpl.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                              "{previewText}"
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/60">
                            <button
                              type="button"
                              onClick={() => handleSelectQuickReply(tpl, false)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Insert text into message input for editing"
                            >
                              <span>Insert</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectQuickReply(tpl, true)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                              title="Send immediately to client"
                            >
                              <Send className="h-2.5 w-2.5" />
                              <span>1-Click Send</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredQuickReplies.length === 0 && (
                      <div className="col-span-2 p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                        No quick replies matched your filter.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fast-Access Quick-Tap Pill Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Fast Reply:</span>
                </span>
                {QUICK_REPLY_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectQuickReply(tpl, false)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    title={`Click to insert: ${tpl.shortSnippet}`}
                  >
                    <span>{tpl.icon}</span>
                    <span>{tpl.label.split(':')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Active Feedback Notice */}
              {quickReplyNotice && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{quickReplyNotice}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Ready in chat box below</span>
                </div>
              )}

              {/* Message History List */}
              <div className="h-40 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {activeOrder.messages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold uppercase text-cyan-400">{m.sender}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message or select a Quick Reply above..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAdminMessage();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />

                {replyText && (
                  <button
                    type="button"
                    onClick={() => setReplyText('')}
                    className="px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendAdminMessage}
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-slate-400 border border-slate-800 rounded-3xl text-sm">
            Select an order request from the list to view details and manage.
          </div>
        )}
      </div>

      {/* Advanced Custom Report & Export Modal */}
      <AdminOrderExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allOrders={orders}
        filteredOrders={filteredOrders}
        activeOrder={activeOrder}
        activeFilterStatus={filterStatus}
        activeFilterPriority={filterPriority}
      />
    </div>
  );
};

