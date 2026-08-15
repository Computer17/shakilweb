import React, { useState, useEffect } from 'react';
import { OrderRequest, EmailLog } from '../../types';
import { OrderTimeline } from '../common/OrderTimeline';
import { generateOrderPdf } from '../../utils/pdfGenerator';
import {
  X,
  Search,
  Package,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  FileText,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Phone,
  AlertCircle,
  Download,
  Mail,
  Bell,
  BellRing,
  Check,
  Star,
  ThumbsUp,
  Edit3,
  MessageCircle,
  Eye,
  History,
  Inbox,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface ClientOrderTrackerModalProps {
  orders: OrderRequest[];
  onClose: () => void;
  initialOrderId?: string;
}

export const ClientOrderTrackerModal: React.FC<ClientOrderTrackerModalProps> = ({
  orders,
  onClose,
  initialOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [activeOrder, setActiveOrder] = useState<OrderRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Email Notification Subscription State
  const [emailInput, setEmailInput] = useState('');
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState<string | null>(null);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<EmailLog | null>(null);
  const [showEmailLogs, setShowEmailLogs] = useState(false);

  // Feedback Review State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState<string | null>(null);
  const [isEditingReview, setIsEditingReview] = useState<boolean>(false);

  // Historical Log & Tabs State
  const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [allOrdersStore, setAllOrdersStore] = useState<OrderRequest[]>(orders || []);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data: OrderRequest[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllOrdersStore(data);
        }
      })
      .catch((err) => console.error('Failed to fetch orders store:', err));
  }, []);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setAllOrdersStore((prev) => {
        const map = new Map<string, OrderRequest>();
        prev.forEach((o) => map.set(o.id, o));
        orders.forEach((o) => map.set(o.id, o));
        return Array.from(map.values());
      });
    }
  }, [orders]);

  // Compute all orders belonging to current client / search context
  const userOrders = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (activeOrder) {
      const cEmail = activeOrder.clientEmail?.trim().toLowerCase();
      const cPhone = activeOrder.clientPhone?.trim();
      const cName = activeOrder.clientName?.trim().toLowerCase();

      const matched = allOrdersStore.filter((o) => {
        if (o.id === activeOrder.id) return true;
        if (cEmail && o.clientEmail && o.clientEmail.trim().toLowerCase() === cEmail) return true;
        if (cPhone && o.clientPhone && o.clientPhone.trim() === cPhone) return true;
        if (cName && o.clientName && o.clientName.trim().toLowerCase() === cName) return true;
        return false;
      });

      if (matched.length > 0) return matched;
    }

    if (q) {
      const matched = allOrdersStore.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.clientName && o.clientName.toLowerCase().includes(q)) ||
          (o.clientPhone && o.clientPhone.includes(q)) ||
          (o.clientEmail && o.clientEmail.toLowerCase().includes(q))
      );
      if (matched.length > 0) return matched;
    }

    return allOrdersStore;
  }, [allOrdersStore, activeOrder, searchQuery]);

  const historyCounts = React.useMemo(() => {
    const all = userOrders.length;
    const active = userOrders.filter((o) =>
      ['WORK_IN_PROGRESS', 'AUTO_ACCEPTED', 'REVIEW_PENDING'].includes(o.status)
    ).length;
    const completed = userOrders.filter((o) => o.status === 'COMPLETED').length;
    const cancelled = userOrders.filter((o) => o.status === 'CANCELLED' || o.status === 'PENDING').length;

    return { all, active, completed, cancelled };
  }, [userOrders]);

  const filteredHistoryOrders = React.useMemo(() => {
    return userOrders.filter((o) => {
      if (historyFilter === 'ACTIVE') {
        return ['WORK_IN_PROGRESS', 'AUTO_ACCEPTED', 'REVIEW_PENDING'].includes(o.status);
      }
      if (historyFilter === 'COMPLETED') {
        return o.status === 'COMPLETED';
      }
      if (historyFilter === 'CANCELLED') {
        return o.status === 'CANCELLED' || o.status === 'PENDING';
      }
      return true;
    });
  }, [userOrders, historyFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'WORK_IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span>Work In Progress</span>
          </span>
        );
      case 'AUTO_ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Auto-Accepted</span>
          </span>
        );
      case 'REVIEW_PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shrink-0">
            <Clock className="h-3.5 w-3.5" />
            <span>Review Pending</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shrink-0">
            <X className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            {status}
          </span>
        );
    }
  };

  useEffect(() => {
    if (activeOrder) {
      setEmailInput(activeOrder.clientEmail || '');
      setEmailSubscribed(Boolean(activeOrder.emailSubscribed));
      setSubscribeMessage(null);

      if (activeOrder.review) {
        setReviewRating(activeOrder.review.rating || 5);
        setReviewComment(activeOrder.review.comment || '');
      } else {
        setReviewRating(5);
        setReviewComment('');
      }
      setIsEditingReview(false);
      setReviewSubmittedMsg(null);
    }
  }, [activeOrder]);

  const handleDownloadSummary = () => {
    if (!activeOrder) return;
    setDownloadingPdf(true);
    try {
      generateOrderPdf(activeOrder);
    } catch (err) {
      console.error('Failed to generate PDF summary', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 600);
    }
  };

  const handleToggleEmailSubscription = async (targetState?: boolean) => {
    if (!activeOrder) return;
    const nextState = targetState !== undefined ? targetState : !emailSubscribed;

    if (nextState && !emailInput.trim()) {
      setSubscribeMessage('Please enter a valid email address to enable alerts.');
      return;
    }

    setSubscribing(true);
    setSubscribeMessage(null);

    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/subscribe-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), subscribe: nextState }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSubscribed(data.emailSubscribed);
        setSubscribeMessage(
          data.emailSubscribed
            ? `✓ Email notifications active for ${data.clientEmail || emailInput}!`
            : 'Email notifications disabled.'
        );
        if (data.order) {
          setActiveOrder(data.order);
        } else {
          setActiveOrder({
            ...activeOrder,
            emailSubscribed: data.emailSubscribed,
            clientEmail: data.clientEmail || emailInput,
          });
        }
      } else {
        setSubscribeMessage(data.message || 'Failed to update email subscription.');
      }
    } catch (err) {
      setSubscribeMessage('Server connection error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!activeOrder) return;
    if (!emailInput.trim()) {
      setTestEmailMsg('Please enter a valid email address to receive a test alert.');
      return;
    }

    setSendingTestEmail(true);
    setTestEmailMsg(null);

    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/send-test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailMsg(`✓ ${data.message}`);
        if (data.order) {
          setActiveOrder(data.order);
        }
      } else {
        setTestEmailMsg(data.message || 'Failed to send test email alert.');
      }
    } catch (err) {
      setTestEmailMsg('Server connection error. Please try again.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!activeOrder) return;
    if (!reviewComment.trim()) {
      setReviewSubmittedMsg('Please enter a short comment about your experience with Shakil.');
      return;
    }

    setReviewSubmitting(true);
    setReviewSubmittedMsg(null);

    try {
      const res = await fetch(`/api/orders/${activeOrder.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
          clientName: activeOrder.clientName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSubmittedMsg('✓ Thank you! Your review has been saved successfully.');
        setIsEditingReview(false);
        if (data.order) {
          setActiveOrder(data.order);
        } else {
          setActiveOrder({
            ...activeOrder,
            review: data.review,
          });
        }
      } else {
        setReviewSubmittedMsg(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewSubmittedMsg('Server connection error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Auto look up if initialOrderId provided
  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    } else if (orders.length > 0) {
      setActiveOrder(orders[0]);
    }
  }, [initialOrderId, orders]);

  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setSearched(true);

    // Find in prop orders or fetch live from server
    const match = orders.find(
      (o) =>
        o.id.toLowerCase() === q ||
        o.id.toLowerCase().includes(q) ||
        (o.clientName && o.clientName.toLowerCase().includes(q)) ||
        (o.clientPhone && o.clientPhone.includes(q)) ||
        (o.clientEmail && o.clientEmail.toLowerCase().includes(q))
    );

    if (match) {
      setActiveOrder(match);
      setLoading(false);
    } else {
      // Attempt API lookup
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data: OrderRequest[]) => {
          if (Array.isArray(data)) {
            const apiMatch = data.find(
              (o) =>
                o.id.toLowerCase() === q ||
                o.id.toLowerCase().includes(q) ||
                (o.clientName && o.clientName.toLowerCase().includes(q)) ||
                (o.clientPhone && o.clientPhone.includes(q))
            );
            setActiveOrder(apiMatch || null);
          } else {
            setActiveOrder(null);
          }
        })
        .catch(() => setActiveOrder(null))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Package className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Live Status Tracker
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Track Project Progress Real-Time
          </h2>
          <p className="text-xs text-slate-400">
            Enter your Order ID (e.g. <strong className="text-cyan-300">ORD-8921</strong>) or phone number to check project timeline.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by Order ID (e.g. ORD-8921) or Client Name / Phone..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            className="px-5 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-400 transition-colors shrink-0 flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Track Order</span>
          </button>
        </div>

        {/* Recent Orders Quick Select Chips */}
        {orders.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Recent Orders in System:</span>
            <div className="flex flex-wrap gap-2">
              {orders.slice(0, 5).map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => {
                    setSearchQuery(ord.id);
                    setActiveOrder(ord);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    activeOrder?.id === ord.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-cyan-400 font-mono font-bold mr-1.5">{ord.id}</span>
                  <span>{ord.serviceTitle || ord.clientName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 gap-2 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Live Order Tracker</span>
            {activeOrder && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {activeOrder.id}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="h-4 w-4" />
            <span>My Order History</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {userOrders.length}
            </span>
          </button>
        </div>

        {/* TAB 1: LIVE ORDER TRACKER */}
        {activeTab === 'tracker' && (
          activeOrder ? (
          <div className="space-y-6 pt-2">
            {/* Real-Time Client Notification Status Alert Banner */}
            {activeOrder.status === 'ACCEPTED' ? (
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 shadow-lg shadow-emerald-500/10 space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                          ✓ Order Approved by Shakil
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Live Status: Scheduled
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        🎉 আপনার অর্ডারটি অ্যাপ্রুভ (Approved) করা হয়েছে!
                      </h3>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-xs text-slate-400 block font-medium">Agreed Price:</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {activeOrder.price || activeOrder.budget || '৳800'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-400 font-bold block mb-0.5">Estimated Completion:</span>
                    <span className="text-slate-300">
                      {activeOrder.estimatedCompletion || activeOrder.requestedDelivery || '24 Hours'}
                    </span>
                  </div>
                  {activeOrder.adminNotes && (
                    <div className="text-slate-300 italic sm:text-right">
                      "{activeOrder.adminNotes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>WhatsApp & Email Alert Dispatched to Client</span>
                  </div>
                  <a
                    href={`https://wa.me/8801890193985?text=${encodeURIComponent(`Hi Shakil, thank you for accepting order ${activeOrder.id} (${activeOrder.serviceTitle}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp Shakil</span>
                  </a>
                </div>
              </div>
            ) : activeOrder.status === 'REJECTED' ? (
              <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/60 bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-950 shadow-lg shadow-rose-500/10 space-y-3 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
                          ⚠️ Order Declined
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Live Status: Declined
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                        অর্ডার রিকোয়েস্টটি প্রত্যাখ্যাত হয়েছে (Declined)
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs space-y-1">
                  <span className="text-rose-400 font-bold block">Admin Feedback / Reason:</span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    "{activeOrder.adminNotes || 'Task specifications or timeframe require revision. Please contact Shakil directly on WhatsApp to adjust requirements.'}"
                  </p>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-rose-500/20 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Need clarification or alternative scope?
                  </span>
                  <a
                    href={`https://wa.me/8801890193985?text=${encodeURIComponent(`Hi Shakil, regarding declined order ${activeOrder.id}: can we discuss adjustments?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Discuss on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : activeOrder.status === 'COMPLETED' ? (
              <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                      ✓ Complete & Delivered
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                      🎉 কাজ সম্পন্ন হয়েছে! সমস্ত ফাইল ও রিপোর্ট তৈরি।
                    </h3>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Main Progress Bar & Timeline Indicator Component */}
            <OrderTimeline
              status={activeOrder.status}
              orderId={activeOrder.id}
              serviceTitle={activeOrder.serviceTitle}
              estimatedCompletion={activeOrder.estimatedCompletion || activeOrder.requestedDelivery}
            />

            {/* Email Notification Updates Toggle Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 transition-colors ${
                    emailSubscribed
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}>
                    <BellRing className={`h-5 w-5 ${emailSubscribed ? 'animate-bounce text-cyan-400' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">Get Email Updates</h4>
                      {emailSubscribed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                          <Check className="h-3 w-3" /> Subscribed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Receive automated instant email alerts whenever Shakil changes your project status.
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-300">
                    {emailSubscribed ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleEmailSubscription()}
                    disabled={subscribing}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailSubscribed ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        emailSubscribed ? 'translate-x-5 bg-white' : 'translate-x-0 bg-slate-400'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Email Input & Actions */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address (e.g. client@example.com)..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleEmailSubscription(true)}
                    disabled={subscribing || !emailInput.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {subscribing ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Bell className="h-3.5 w-3.5" />
                    )}
                    <span>{emailSubscribed ? 'Save Preference' : 'Subscribe'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail || !emailInput.trim()}
                    className="px-3.5 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Send a sample email status alert to verify delivery"
                  >
                    {sendingTestEmail ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>Test Alert Email</span>
                  </button>
                </div>
              </div>

              {/* Feedback Messages */}
              {subscribeMessage && (
                <p className={`text-[11px] font-medium ${
                  subscribeMessage.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {subscribeMessage}
                </p>
              )}

              {testEmailMsg && (
                <p className={`text-[11px] font-medium ${
                  testEmailMsg.startsWith('✓') ? 'text-cyan-300' : 'text-amber-400'
                }`}>
                  {testEmailMsg}
                </p>
              )}

              {/* Email Notification Audit Logs Accordion */}
              {activeOrder.emailLogs && activeOrder.emailLogs.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowEmailLogs(!showEmailLogs)}
                    className="w-full flex items-center justify-between text-xs font-bold text-indigo-300 hover:text-indigo-200 py-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Inbox className="h-3.5 w-3.5" />
                      <span>Sent Email Notification History ({activeOrder.emailLogs.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 underline">
                      {showEmailLogs ? 'Hide History' : 'View Logs & Previews'}
                    </span>
                  </button>

                  {showEmailLogs && (
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeOrder.emailLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/20 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] font-bold">
                                {log.deliveryStatus}
                              </span>
                              <span className="font-semibold text-white truncate text-[11px]">
                                {log.subject}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              To: {log.recipientEmail} • {log.sentAt}
                            </p>
                          </div>

                          {log.previewHtml && (
                            <button
                              type="button"
                              onClick={() => setSelectedEmailPreview(log)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Preview HTML</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PDF Summary & Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white">Official Project Order Summary</h4>
                  <p className="text-[11px] text-slate-400">Generate a downloadable PDF document with order specs, status, and timeline history.</p>
                </div>
              </div>

              <button
                onClick={handleDownloadSummary}
                disabled={downloadingPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {downloadingPdf ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Summary (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* Client Feedback & Rating Review Section */}
            <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/10 to-slate-950 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <Star className="h-5 w-5 fill-amber-400/30 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Client Experience & Review</span>
                      {activeOrder.status === 'COMPLETED' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
                          Completed Order
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold">
                          Project Review
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Submit feedback for Shakil to share your experience with this order.
                    </p>
                  </div>
                </div>

                {activeOrder.review && !isEditingReview && (
                  <button
                    onClick={() => setIsEditingReview(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Review</span>
                  </button>
                )}
              </div>

              {/* Display Existing Review if present and not editing */}
              {activeOrder.review && !isEditingReview ? (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= activeOrder.review!.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-1.5">
                        {activeOrder.review.rating}.0 / 5.0
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeOrder.review.submittedAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 italic leading-relaxed pl-2 border-l-2 border-amber-500/50">
                    "{activeOrder.review.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Reviewed by: <strong className="text-slate-200">{activeOrder.review.clientName || activeOrder.clientName}</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" /> Verified Client Review
                    </span>
                  </div>
                </div>
              ) : (
                /* Submit or Edit Form */
                <div className="space-y-3 pt-1">
                  {/* Interactive Star Rating Selector */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-300">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 transition-transform ${
                              star <= (hoverRating || reviewRating)
                                ? 'text-amber-400 fill-amber-400 scale-110'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {['', '1 - Needs Improvement', '2 - Fair', '3 - Good', '4 - Very Good!', '5 - Outstanding! ⭐'][hoverRating || reviewRating]}
                    </span>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-1">
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share a short review about Shakil's work quality, communication, or speed..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting || !reviewComment.trim()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        {reviewSubmitting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Saving Review...</span>
                          </>
                        ) : (
                          <>
                            <Star className="h-3.5 w-3.5 fill-slate-950" />
                            <span>{activeOrder.review ? 'Update Feedback' : 'Submit Review'}</span>
                          </>
                        )}
                      </button>

                      {isEditingReview && (
                        <button
                          type="button"
                          onClick={() => setIsEditingReview(false)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {reviewSubmittedMsg && (
                      <p className={`text-[11px] font-medium ${
                        reviewSubmittedMsg.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {reviewSubmittedMsg}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Order Info</span>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client Name:</span>
                    <span className="font-semibold text-white">{activeOrder.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact:</span>
                    <span className="text-slate-300">{activeOrder.clientPhone || activeOrder.clientEmail || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quoted Price:</span>
                    <span className="font-bold text-emerald-400">{activeOrder.price || activeOrder.budget || 'In Review'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Files Attached:</span>
                    <span className="text-cyan-300 font-semibold">{activeOrder.fileCount || 0} File(s)</span>
                  </div>
                </div>
              </div>

              {/* Instant Contact Links */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Need Direct Update?</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Have questions about this order? Contact Shakil directly on your preferred app.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hi Shakil, checking on Order ID: ${activeOrder.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href="https://t.me/shakil_workhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600/20 border border-sky-500/40 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-600/30 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Admin Notes / Updates if any */}
            {activeOrder.adminNotes && (
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-1">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Update from Shakil:</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {activeOrder.adminNotes}
                </p>
              </div>
            )}
          </div>
        ) : searched ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950 space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Order Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Could not find an active order matching "<strong className="text-slate-200">{searchQuery}</strong>". Check your Order ID or view your complete Order History log below.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>Switch to Order History Log ({userOrders.length})</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2">
            <Package className="h-8 w-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">Select an order above or click below to browse your order log.</p>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>View Order History Log ({userOrders.length})</span>
            </button>
          </div>
        )
      )}

      {/* TAB 2: ORDER HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Inbox className="h-4 w-4 text-indigo-400" />
                <span>Historical Order Log</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Categorized record of all past and active project requests submitted to Shakil WorkHub.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-xl self-start sm:self-auto">
              Total: {userOrders.length} Order(s)
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            <button
              type="button"
              onClick={() => setHistoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'ALL'
                  ? 'bg-slate-200 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              All Orders ({historyCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'ACTIVE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-amber-300'
              }`}
            >
              In Progress ({historyCounts.active})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'COMPLETED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-emerald-300'
              }`}
            >
              Completed ({historyCounts.completed})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('CANCELLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                historyFilter === 'CANCELLED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-rose-300'
              }`}
            >
              Cancelled / Pending ({historyCounts.cancelled})
            </button>
          </div>

          {/* Categorized Cards List */}
          {filteredHistoryOrders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950 space-y-2">
              <Filter className="h-6 w-6 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">No orders found in this category filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistoryOrders.map((ord) => (
                <div
                  key={ord.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    activeOrder?.id === ord.id
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-cyan-400 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30">
                        {ord.id}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">{ord.serviceTitle}</h4>
                    </div>
                    {getStatusBadge(ord.status)}
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Price / Budget</span>
                      <span className="font-extrabold text-emerald-400">{ord.price || ord.budget || 'In Review'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Estimated Delivery</span>
                      <span className="font-semibold text-slate-200">{ord.estimatedCompletion || ord.requestedDelivery || '10-15 Min'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Submission Date</span>
                      <span className="text-slate-300 text-[11px]">{ord.createdAt || 'Recent'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Contact Record</span>
                      <span className="text-slate-300 text-[11px] truncate block">{ord.clientPhone || ord.clientEmail || ord.clientName}</span>
                    </div>
                  </div>

                  {/* Review Snippet if available */}
                  {ord.review && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex text-amber-400 shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < (ord.review?.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-amber-200 font-medium italic truncate">
                          "{ord.review.comment}"
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-extrabold shrink-0">
                        Verified Review
                      </span>
                    </div>
                  )}

                  {/* Card Footer Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ord.messages ? `${ord.messages.length} message log(s)` : '1 log entry'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDownloadingPdf(true);
                          generateOrderPdf(ord);
                          setTimeout(() => setDownloadingPdf(false), 500);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Download PDF Summary"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveOrder(ord);
                          setActiveTab('tracker');
                        }}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Track Live Progress</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* HTML Email Notification Preview Modal */}
        {selectedEmailPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border border-indigo-500/40 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{selectedEmailPreview.subject}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Recipient: {selectedEmailPreview.recipientEmail} • Status: {selectedEmailPreview.deliveryStatus}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-slate-950">
                <iframe
                  title="Email Preview"
                  srcDoc={selectedEmailPreview.previewHtml}
                  className="w-full h-[450px] border-0 rounded-xl bg-slate-950"
                />
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
                <button
                  onClick={() => setSelectedEmailPreview(null)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
