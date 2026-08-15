import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, CheckCircle2, X, Bell, ShieldCheck, AlertCircle, Sparkles, Check, Clock } from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { ServiceDetailPage } from './components/public/ServiceDetailPage';
import { PortfolioSection } from './components/public/PortfolioSection';
import { HowItWorksSection } from './components/public/HowItWorksSection';
import { FaqSection } from './components/public/FaqSection';
import { PublicPostsSection } from './components/public/PublicPostsSection';
import { ContactSection } from './components/public/ContactSection';
import { TrustSection } from './components/public/TrustSection';
import { OrderFlowModal } from './components/public/OrderFlowModal';
import { ClientOrderTrackerModal } from './components/public/ClientOrderTrackerModal';
import { ClientAuthModal } from './components/auth/ClientAuthModal';
import { MandatoryAuthScreen } from './components/auth/MandatoryAuthScreen';
import { WorkspaceHubModal } from './components/workspace/WorkspaceHubModal';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminOrdersManager } from './components/admin/AdminOrdersManager';
import { AdminClientsManager } from './components/admin/AdminClientsManager';
import { AdminSiteSettingsManager } from './components/admin/AdminSiteSettingsManager';
import { AdminAnalyticsDashboard } from './components/admin/AdminAnalyticsDashboard';

import { INITIAL_SERVICES } from './data/servicesData';
import {
  INITIAL_PORTFOLIO,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_AUTO_ACCEPT_RULES,
  INITIAL_JOB_OPPORTUNITIES,
} from './data/mockStore';

import {
  ServiceItem,
  OrderRequest,
  ClientRecord,
  AdminStats,
  SiteSettings,
  UserAccount,
  ClientNotification,
  OrderStatus,
} from './types';

// Default initial client notifications for demo context
const INITIAL_CLIENT_NOTIFICATIONS: ClientNotification[] = [
  {
    id: 'notif-1',
    orderId: '#WH-8921',
    type: 'ACCEPTED',
    title: '🎉 Order #WH-8921 Approved!',
    message: 'Shakil has accepted your PDF Conversion project. Estimated delivery: 12 Hours.',
    timestamp: 'Just now',
    read: false,
    data: {
      status: 'ACCEPTED',
      price: '৳800',
      estimatedCompletion: '12 Hours',
      adminNotes: 'Work scheduled and specialist assigned.',
    },
  },
];

export default function App() {
  // Determine initial view from URL (/admin, /admin/orders, #admin, etc.)
  const getInitialView = (): { view: string; tab?: string } => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isSavedAdmin = Boolean(localStorage.getItem('shakil_admin_token'));

    if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin')) {
      if (isSavedAdmin) {
        if (path.includes('/orders') || hash.includes('/orders')) return { view: 'admin-dashboard', tab: 'orders' };
        if (path.includes('/clients') || hash.includes('/clients')) return { view: 'admin-dashboard', tab: 'clients' };
        if (path.includes('/analytics') || hash.includes('/analytics')) return { view: 'admin-dashboard', tab: 'analytics' };
        if (path.includes('/settings') || hash.includes('/settings')) return { view: 'admin-dashboard', tab: 'site-cms' };
        return { view: 'admin-dashboard', tab: 'overview' };
      }
      return { view: 'admin-login' };
    }
    return { view: 'home' };
  };

  const initialRoute = getInitialView();
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('shakil_admin_token'));
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('shakil_admin_token');
  });
  const [adminTab, setAdminTab] = useState<string>(initialRoute.tab || 'overview');
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<string | undefined>(undefined);

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteTitle: 'SHAKIL WORKHUB',
    heroHeadline: 'Premium Web Development & Automation Services',
    heroSubheadline: 'High-speed, top-tier technical services with transparent delivery and direct support.',
    announcementText: '⚡ Fast 24-48h Delivery for Data & Web Projects!',
    whatsappNumber: '01890193985',
    telegramUsername: '@DarkPrince_Dev',
    helplinePhone: '+8809646175520',
    adminEmail: 'm.p.17.lal.2.com@gmail.com',
  });

  // User Client Account State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('shakil_user_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [showUserAuthModal, setShowUserAuthModal] = useState<boolean>(false);

  // Client Notification Center Store
  const [clientNotifications, setClientNotifications] = useState<ClientNotification[]>(() => {
    const saved = localStorage.getItem('shakil_client_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLIENT_NOTIFICATIONS;
      }
    }
    return INITIAL_CLIENT_NOTIFICATIONS;
  });

  // Toast Notification System
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      type?: 'success' | 'info' | 'order' | 'warning' | 'rejected' | 'accepted';
      timestamp: string;
      orderId?: string;
    }>
  >([]);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'order' | 'warning' | 'rejected' | 'accepted' = 'order',
    orderId?: string
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      orderId,
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 6));

    // Automatically remove toast after 7 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add & Persist Client Notification
  const addClientNotification = useCallback(
    (notification: Omit<ClientNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: ClientNotification = {
        ...notification,
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };

      setClientNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 30);
        localStorage.setItem('shakil_client_notifications', JSON.stringify(updated));
        return updated;
      });

      // Also pop an immediate in-app toast
      addToast(
        newNotif.title,
        newNotif.message,
        newNotif.type === 'ACCEPTED'
          ? 'accepted'
          : newNotif.type === 'REJECTED'
          ? 'rejected'
          : 'order',
        newNotif.orderId
      );
    },
    []
  );

  const handleMarkNotificationsRead = () => {
    setClientNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('shakil_client_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderModalPreselectedId, setOrderModalPreselectedId] = useState<string | undefined>(undefined);
  const [orderModalContext, setOrderModalContext] = useState<string | undefined>(undefined);

  // Tracker Modal State
  const [trackerModalOpen, setTrackerModalOpen] = useState<boolean>(false);
  const [trackerInitialOrderId, setTrackerInitialOrderId] = useState<string | undefined>(undefined);

  // Google Workspace Hub State
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState<boolean>(false);
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<'drive' | 'gmail' | 'chat'>('drive');
  const [workspaceOrderContext, setWorkspaceOrderContext] = useState<any>(undefined);

  // Data Collections
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [portfolio, setPortfolio] = useState(INITIAL_PORTFOLIO);
  const [orders, setOrders] = useState<OrderRequest[]>(INITIAL_ORDERS);
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);

  // Sync browser URL for /admin routing and PopState / Hash navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isSavedAdmin = Boolean(localStorage.getItem('shakil_admin_token'));

      if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin')) {
        if (isSavedAdmin) {
          setIsAdminLoggedIn(true);
          setCurrentView('admin-dashboard');
          if (path.includes('/orders') || hash.includes('/orders')) setAdminTab('orders');
          else if (path.includes('/clients') || hash.includes('/clients')) setAdminTab('clients');
          else if (path.includes('/analytics') || hash.includes('/analytics')) setAdminTab('analytics');
          else if (path.includes('/settings') || hash.includes('/settings')) setAdminTab('site-cms');
        } else {
          setCurrentView('admin-login');
        }
      } else if (currentView === 'admin-dashboard' || currentView === 'admin-login') {
        // If navigating away from admin via URL
        if (path === '/' || path === '') {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Global shortcut Ctrl+Shift+A or Cmd+Shift+A for instant admin access
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminLoggedIn) {
          window.history.pushState(null, '', '/admin');
          setCurrentView('admin-dashboard');
        } else {
          window.history.pushState(null, '', '/admin');
          setCurrentView('admin-login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminLoggedIn, currentView]);

  // Fetch Site Settings from Server
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.whatsappNumber) setSiteSettings(data);
      })
      .catch(() => console.log('Using default site settings state'));
  }, []);

  // Fetch initial orders from server endpoint
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      })
      .catch(() => console.log('Using default order store state'));
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'service-detail' && param) {
      setSelectedServiceSlug(param);
      setCurrentView('service-detail');
      return;
    }

    if (view === 'order-service') {
      setOrderModalPreselectedId(param);
      setOrderModalContext(undefined);
      setOrderModalOpen(true);
      return;
    }

    if (view === 'track-order') {
      setTrackerInitialOrderId(param);
      setTrackerModalOpen(true);
      return;
    }

    if (view === 'admin-login') {
      window.history.pushState(null, '', '/admin');
      setCurrentView('admin-login');
      return;
    }

    if (view === 'admin-dashboard') {
      window.history.pushState(null, '', '/admin');
      setCurrentView('admin-dashboard');
      return;
    }

    if (view === 'home') {
      window.history.pushState(null, '', '/');
      setCurrentView('home');
      return;
    }

    setCurrentView(view);
  };

  const handleOpenOrderModalWithContext = (serviceId: string, context?: string) => {
    setOrderModalPreselectedId(serviceId);
    setOrderModalContext(context);
    setOrderModalOpen(true);
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('shakil_admin_token', token);
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    window.history.pushState(null, '', '/admin');
    setCurrentView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('shakil_admin_token');
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    window.history.pushState(null, '', '/');
    setCurrentView('home');
    addToast('Admin Logged Out', 'You have returned to the public site view.', 'info');
  };

  // Central Order Update Handler with Automated Client Notifications on Accept / Reject / Price / Delivery
  const handleUpdateOrder = async (orderId: string, updates: any) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    const oldStatus = existingOrder?.status;
    const newStatus = updates.status as OrderStatus | undefined;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      // Local state fallback
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o))
      );
    }

    // AUTOMATED CLIENT NOTIFICATIONS DISPATCH
    if (newStatus && newStatus !== oldStatus) {
      if (newStatus === 'ACCEPTED') {
        addClientNotification({
          orderId,
          type: 'ACCEPTED',
          title: `🎉 Order ${orderId} has been ACCEPTED!`,
          message: `Shakil has approved your order for "${existingOrder?.serviceTitle || 'Project'}". Work is now scheduled. Price: ${updates.price || existingOrder?.price || 'Confirmed'}.`,
          data: {
            status: 'ACCEPTED',
            price: updates.price || existingOrder?.price,
            estimatedCompletion: updates.estimatedCompletion || existingOrder?.estimatedCompletion,
            adminNotes: updates.adminNotes,
          },
        });
      } else if (newStatus === 'REJECTED') {
        addClientNotification({
          orderId,
          type: 'REJECTED',
          title: `⚠️ Order ${orderId} Request Declined`,
          message: `Your request could not be accepted as submitted. Reason: "${updates.adminNotes || 'Please contact Shakil on WhatsApp for custom adjustments'}".`,
          data: {
            status: 'REJECTED',
            adminNotes: updates.adminNotes,
          },
        });
      } else if (newStatus === 'IN_PROGRESS') {
        addClientNotification({
          orderId,
          type: 'IN_PROGRESS',
          title: `⚡ Work In Progress for Order ${orderId}`,
          message: `Specialist Shakil is actively working on your project deliverables.`,
          data: {
            status: 'IN_PROGRESS',
          },
        });
      } else if (newStatus === 'COMPLETED') {
        addClientNotification({
          orderId,
          type: 'COMPLETED',
          title: `🎉 Order ${orderId} COMPLETED & Ready!`,
          message: `Work for "${existingOrder?.serviceTitle || 'Project'}" is complete and ready for download. Please review and leave your feedback!`,
          data: {
            status: 'COMPLETED',
          },
        });
      } else if (newStatus === 'ADMIN_REVIEW') {
        addClientNotification({
          orderId,
          type: 'ADMIN_REVIEW',
          title: `🔍 Order ${orderId} Under Active Review`,
          message: `Admin Shakil is reviewing your files and requirements.`,
          data: {
            status: 'ADMIN_REVIEW',
          },
        });
      }
    } else if (
      (updates.price && updates.price !== existingOrder?.price) ||
      (updates.estimatedCompletion && updates.estimatedCompletion !== existingOrder?.estimatedCompletion)
    ) {
      addClientNotification({
        orderId,
        type: 'PRICE_PROPOSAL',
        title: `💰 Price / Delivery Proposal for Order ${orderId}`,
        message: `Admin proposed Price: ${updates.price || existingOrder?.price} | Target Delivery: ${updates.estimatedCompletion || existingOrder?.estimatedCompletion}`,
        data: {
          price: updates.price,
          estimatedCompletion: updates.estimatedCompletion,
          adminNotes: updates.adminNotes,
        },
      });
    }
  };

  const handleSendMessage = async (orderId: string, text: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      }
    } catch (err) {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            const newMsg = {
              id: 'm-' + Date.now(),
              sender: 'admin' as const,
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            return { ...o, messages: [...o.messages, newMsg] };
          }
          return o;
        })
      );
    }

    // Trigger client notification for admin message
    addClientNotification({
      orderId,
      type: 'MESSAGE',
      title: `💬 New Message from Shakil on Order ${orderId}`,
      message: text.length > 100 ? `${text.slice(0, 97)}...` : text,
    });
  };

  // Compute Admin Dashboard Stats
  const adminStats: AdminStats = {
    newOrders: orders.filter((o) => o.status === 'NEW').length,
    pendingReviews: orders.filter((o) => o.status === 'ADMIN_REVIEW').length,
    activeProjects: orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS').length,
    completedJobs: orders.filter((o) => o.status === 'COMPLETED').length,
    earningsThisMonthBDT: 18500,
    totalEarningsBDT: 142000,
    totalClients: clients.length,
    jobOpportunitiesCount: INITIAL_JOB_OPPORTUNITIES.length,
  };

  const activeService = services.find((s) => s.slug === selectedServiceSlug) || services[0];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#F0F2F5] text-slate-900 light'
      }`}
    >
      {/* ADMIN WORK OS WORKSPACE VIEW (Accessible ONLY via /admin or secret shortcut) */}
      {currentView === 'admin-dashboard' && isAdminLoggedIn ? (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
          <AdminSidebar
            activeTab={adminTab}
            onSelectTab={(tab) => {
              setAdminTab(tab);
              window.history.pushState(null, '', `/admin/${tab}`);
            }}
            onLogout={handleAdminLogout}
            newOrdersCount={adminStats.newOrders}
          />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-screen">
            {adminTab === 'overview' && (
              <AdminOverview
                stats={adminStats}
                orders={orders}
                onNavigateTab={(tab, orderId) => {
                  setAdminTab(tab);
                  window.history.pushState(null, '', `/admin/${tab}`);
                  if (orderId) setSelectedAdminOrderId(orderId);
                }}
              />
            )}

            {adminTab === 'orders' && (
              <AdminOrdersManager
                orders={orders}
                onUpdateOrder={handleUpdateOrder}
                onSendMessage={handleSendMessage}
                selectedOrderId={selectedAdminOrderId}
                onOpenWorkspace={(tab, orderContext) => {
                  setWorkspaceInitialTab(tab);
                  setWorkspaceOrderContext(orderContext);
                  setWorkspaceModalOpen(true);
                }}
              />
            )}

            {adminTab === 'clients' && <AdminClientsManager clients={clients} />}

            {['site-cms', 'services-mgr', 'portfolio-mgr'].includes(adminTab) && (
              <AdminSiteSettingsManager
                settings={siteSettings}
                services={services}
                portfolio={portfolio}
                onSaveSettings={async (newSettings) => {
                  setSiteSettings(newSettings);
                  await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSettings),
                  });
                }}
                onUpdateServices={async (newServices) => {
                  setServices(newServices);
                }}
                onUpdatePortfolio={async (newPortfolio) => {
                  setPortfolio(newPortfolio);
                }}
              />
            )}

            {adminTab === 'workspace' && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-cyan-400" />
                      <span>Google Workspace Command Center</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Manage Google Drive deliverables, Gmail customer inquiries, and Google Chat spaces directly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkspaceInitialTab('drive');
                      setWorkspaceOrderContext(undefined);
                      setWorkspaceModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Launch Workspace Hub</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => {
                      setWorkspaceInitialTab('drive');
                      setWorkspaceModalOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        📁
                      </div>
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                        Cloud Files
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      Google Drive
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload project deliverables, browse client files, and generate shared Drive links.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setWorkspaceInitialTab('gmail');
                      setWorkspaceModalOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500/50 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                        ✉️
                      </div>
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                        Email OS
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      Gmail Client
                    </h3>
                    <p className="text-xs text-slate-400">
                      Review client emails, send official project updates, and dispatch milestone notices with 1-click confirmation.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setWorkspaceInitialTab('chat');
                      setWorkspaceModalOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        💬
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Team Spaces
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Google Chat
                    </h3>
                    <p className="text-xs text-slate-400">
                      Post milestone alerts and automated task updates directly into your Google Chat spaces.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'analytics' && (
              <AdminAnalyticsDashboard
                orders={orders}
                stats={adminStats}
                onNavigateTab={(tab, orderId) => {
                  setAdminTab(tab);
                  window.history.pushState(null, '', `/admin/${tab}`);
                  if (orderId) setSelectedAdminOrderId(orderId);
                }}
              />
            )}

            {['ai-rules', 'client-hunter', 'web-apps', 'files', 'posts-mgr'].includes(
              adminTab
            ) && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 space-y-4">
                <h2 className="text-xl font-bold text-white capitalize">{adminTab.replace('-', ' ')} Manager</h2>
                <p className="text-xs text-slate-400">
                  Configure rules, automation triggers, and management options for {adminTab}.
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-semibold">
                  ✓ Active Work OS Engine Connected. All parameters synced.
                </div>
              </div>
            )}
          </main>
        </div>
      ) : currentView === 'admin-login' ? (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => {
            window.history.pushState(null, '', '/');
            setCurrentView('home');
          }}
        />
      ) : !currentUser ? (
        /* MANDATORY FIRST-TIME ENTRY GATE: Phone/Email Login/Register with Mandatory OTP */
        <MandatoryAuthScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('shakil_user_account', JSON.stringify(user));
            addToast(
              'স্বাগতম!',
              `${user.name || 'সম্মানিত ক্লায়েন্ট'}, Shakil WorkHub-এ আপনার লগইন সফল হয়েছে।`,
              'success'
            );
          }}
          onOpenAdminLogin={() => {
            window.history.pushState(null, '', '/admin');
            setCurrentView('admin-login');
          }}
          siteSettings={siteSettings}
        />
      ) : (
        /* PUBLIC PORTFOLIO APP VIEW (Accessible once logged in) */
        <div className="flex flex-col min-h-screen">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            isAdminLoggedIn={isAdminLoggedIn}
            siteSettings={siteSettings}
            currentUser={currentUser}
            onOpenUserAuthModal={() => setShowUserAuthModal(true)}
            onUserLogout={() => {
              setCurrentUser(null);
              localStorage.removeItem('shakil_user_account');
              addToast('লগআউট সফল', 'আপনি অ্যাকাউন্ট থেকে সফলভাবে লগআউট করেছেন।', 'info');
            }}
            clientNotifications={clientNotifications}
            onMarkNotificationsRead={handleMarkNotificationsRead}
            onOpenTrackerWithOrder={(orderId) => {
              setTrackerInitialOrderId(orderId);
              setTrackerModalOpen(true);
            }}
            onOpenWorkspace={() => {
              setWorkspaceInitialTab('drive');
              setWorkspaceOrderContext(undefined);
              setWorkspaceModalOpen(true);
            }}
          />

          <main className="flex-1">
            {currentView === 'home' && (
              <>
                <Hero onNavigate={handleNavigate} />
                <ServicesSection
                  services={services}
                  onSelectService={(slug) => handleNavigate('service-detail', slug)}
                  onOrderService={(serviceId) => handleNavigate('order-service', serviceId)}
                />
                <TrustSection />
                <HowItWorksSection onOrderService={() => handleNavigate('order-service')} />
                <PortfolioSection portfolio={portfolio} />
                <PublicPostsSection />
                <FaqSection />
                <ContactSection siteSettings={siteSettings} />
              </>
            )}

            {currentView === 'services' && (
              <ServicesSection
                services={services}
                onSelectService={(slug) => handleNavigate('service-detail', slug)}
                onOrderService={(serviceId) => handleNavigate('order-service', serviceId)}
              />
            )}

            {currentView === 'service-detail' && (
              <ServiceDetailPage
                service={activeService}
                onBack={() => handleNavigate('services')}
                onOrderService={handleOpenOrderModalWithContext}
              />
            )}

            {currentView === 'portfolio' && <PortfolioSection portfolio={portfolio} />}

            {currentView === 'how-it-works' && (
              <HowItWorksSection onOrderService={() => handleNavigate('order-service')} />
            )}

            {currentView === 'faq' && <FaqSection />}

            {currentView === 'posts' && <PublicPostsSection />}

            {currentView === 'contact' && <ContactSection siteSettings={siteSettings} />}
          </main>

          <Footer onNavigate={handleNavigate} siteSettings={siteSettings} />

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomNav currentView={currentView} onNavigate={handleNavigate} />

          {/* Order Request Modal */}
          {orderModalOpen && (
            <OrderFlowModal
              services={services}
              preselectedServiceId={orderModalPreselectedId}
              initialContext={orderModalContext}
              onClose={() => setOrderModalOpen(false)}
              onOrderCreated={(newOrder) => {
                setOrders((prev) => [newOrder, ...prev]);
                addToast(
                  'Order Placed Successfully!',
                  `Order #${newOrder.id} for "${newOrder.serviceTitle}" (${newOrder.clientName}) has been created and received.`,
                  'order',
                  newOrder.id
                );
              }}
            />
          )}

          {/* Client Real-Time Order Tracker Modal */}
          {trackerModalOpen && (
            <ClientOrderTrackerModal
              orders={orders}
              initialOrderId={trackerInitialOrderId}
              onClose={() => {
                setTrackerModalOpen(false);
                setTrackerInitialOrderId(undefined);
              }}
            />
          )}

          {/* Client Authentication Modal */}
          {showUserAuthModal && (
            <ClientAuthModal
              onClose={() => setShowUserAuthModal(false)}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                localStorage.setItem('shakil_user_account', JSON.stringify(user));
              }}
            />
          )}

          {/* Google Workspace Hub Modal (Drive, Gmail, Google Chat) */}
          {workspaceModalOpen && (
            <WorkspaceHubModal
              isOpen={workspaceModalOpen}
              onClose={() => {
                setWorkspaceModalOpen(false);
                setWorkspaceOrderContext(undefined);
              }}
              initialTab={workspaceInitialTab}
              orderContext={workspaceOrderContext}
            />
          )}
        </div>
      )}

      {/* Global Toast Notification System */}
      {toasts.length > 0 && (
        <aside
          aria-label="Notifications"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => {
            const isAccepted = toast.type === 'accepted';
            const isRejected = toast.type === 'rejected';

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in flex items-start gap-3 relative overflow-hidden text-slate-100 ${
                  isAccepted
                    ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/90 to-slate-900/95 ring-1 ring-emerald-500/30'
                    : isRejected
                    ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/90 to-slate-900/95 ring-1 ring-rose-500/30'
                    : 'border-cyan-500/40 bg-slate-900/95'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                    isAccepted
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {isAccepted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isRejected ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <ShoppingBag className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-6 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-extrabold truncate ${
                        isAccepted
                          ? 'text-emerald-300'
                          : isRejected
                          ? 'text-rose-300'
                          : 'text-white'
                      }`}
                    >
                      {toast.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {toast.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed break-words">
                    {toast.message}
                  </p>
                  {toast.orderId && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdminLoggedIn && currentView === 'admin-dashboard') {
                            setAdminTab('orders');
                            setSelectedAdminOrderId(toast.orderId);
                          } else {
                            setTrackerInitialOrderId(toast.orderId);
                            setTrackerModalOpen(true);
                          }
                          removeToast(toast.id);
                        }}
                        className={`text-[11px] font-bold underline flex items-center gap-1 cursor-pointer ${
                          isAccepted
                            ? 'text-emerald-300 hover:text-emerald-200'
                            : isRejected
                            ? 'text-rose-300 hover:text-rose-200'
                            : 'text-cyan-400 hover:text-cyan-300'
                        }`}
                      >
                        <span>
                          {isAdminLoggedIn && currentView === 'admin-dashboard'
                            ? 'Open in Orders OS →'
                            : 'Track Order Status →'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </aside>
      )}
    </div>
  );
}
