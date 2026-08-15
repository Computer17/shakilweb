import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Briefcase,
  Layers,
  HelpCircle,
  Mail,
  FileText,
  Sun,
  Moon,
  PlusCircle,
  Menu,
  X,
  CheckCircle2,
  Package,
  Search,
  MessageSquare,
  Send,
  Phone,
  User,
  LogOut,
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SiteSettings, UserAccount, ClientNotification } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isAdminLoggedIn?: boolean;
  siteSettings?: SiteSettings;
  currentUser?: UserAccount | null;
  onOpenUserAuthModal?: () => void;
  onUserLogout?: () => void;
  clientNotifications?: ClientNotification[];
  onMarkNotificationsRead?: () => void;
  onOpenTrackerWithOrder?: (orderId?: string) => void;
  onOpenWorkspace?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  siteSettings,
  currentUser,
  onOpenUserAuthModal,
  onUserLogout,
  clientNotifications = [],
  onMarkNotificationsRead,
  onOpenTrackerWithOrder,
  onOpenWorkspace,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = clientNotifications.filter((n) => !n.read).length;

  const handleNav = (view: string, param?: string) => {
    onNavigate(view, param);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
  };

  // Close notification dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const whatsapp = siteSettings?.whatsappNumber || '01890193985';
  const telegram = siteSettings?.telegramUsername || '@DarkPrince_Dev';
  const phone = siteSettings?.helplinePhone || '+8809646175520';

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ACCEPTED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case 'PRICE_PROPOSAL':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-cyan-400" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <Package className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      {/* Top Direct Contact Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 py-1 px-4 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-0.5">
          <a
            href={`https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors shrink-0"
          >
            <MessageSquare className="h-3 w-3" />
            <span>WhatsApp: {whatsapp}</span>
          </a>

          <a
            href={`https://t.me/${telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold transition-colors shrink-0"
          >
            <Send className="h-3 w-3" />
            <span>Telegram: {telegram}</span>
          </a>

          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold transition-colors shrink-0"
          >
            <Phone className="h-3 w-3" />
            <span>Call: {phone}</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <span className="text-emerald-400 font-semibold">● 24/7 Active Review</span>
          <span>|</span>
          <span className="text-slate-300">Shakil WorkHub Official</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 transition-transform group-hover:scale-105">
            <span className="font-bold text-lg tracking-tight">S</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl">
                {siteSettings?.siteTitle || 'SHAKIL'}
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                WORKHUB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Honest Digital Services</span>
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => handleNav('home')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('services')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'services'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => handleNav('portfolio')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'portfolio'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'how-it-works'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('faq')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'faq'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => handleNav('posts')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'posts'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => handleNav('contact')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentView === 'contact'
                ? 'bg-slate-800 text-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Client Notification Bell & Center */}
          <div ref={notificationDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen && onMarkNotificationsRead) {
                  onMarkNotificationsRead();
                }
              }}
              title="Client Notifications"
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Bell className="h-4.5 w-4.5 text-cyan-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-black text-white">Client Notification Center</span>
                  </div>
                  {clientNotifications.length > 0 && onMarkNotificationsRead && (
                    <button
                      type="button"
                      onClick={onMarkNotificationsRead}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {clientNotifications.length > 0 ? (
                    clientNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (onOpenTrackerWithOrder) {
                            onOpenTrackerWithOrder(notif.orderId);
                          } else {
                            handleNav('track-order');
                          }
                          setNotificationsOpen(false);
                        }}
                        className={`p-3.5 hover:bg-slate-900/90 transition-colors cursor-pointer space-y-1 ${
                          !notif.read ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {getNotificationIcon(notif.type)}
                            <span className="text-xs font-bold text-white leading-tight">
                              {notif.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pl-5.5">
                          {notif.message}
                        </p>
                        {notif.orderId && (
                          <div className="pl-5.5 pt-0.5 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              {notif.orderId}
                            </span>
                            <span className="text-cyan-400 hover:underline font-semibold flex items-center gap-0.5">
                              <span>Track Status</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center space-y-1">
                      <Bell className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">No new notifications</p>
                      <p className="text-[11px] text-slate-500">
                        When Shakil accepts, updates, or completes your order, alerts will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-900/70 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenTrackerWithOrder) {
                        onOpenTrackerWithOrder();
                      } else {
                        handleNav('track-order');
                      }
                      setNotificationsOpen(false);
                    }}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 py-1 block w-full text-center"
                  >
                    Open Live Order Tracker →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Track Order CTA */}
          <button
            onClick={() => handleNav('track-order')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            <Package className="h-3.5 w-3.5 text-cyan-400" />
            <span>Track Order</span>
          </button>

          {/* Google Workspace Hub CTA */}
          {onOpenWorkspace && (
            <button
              type="button"
              onClick={onOpenWorkspace}
              title="Google Workspace Hub (Drive, Gmail, Google Chat)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-slate-900 text-xs font-bold text-cyan-200 hover:border-cyan-400 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden md:inline">Workspace</span>
            </button>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title="Toggle theme"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-300" />}
          </button>

          {/* User Account Login / Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
              <div className="h-6 w-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[11px]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-white max-w-[100px] truncate">{currentUser.name}</span>
              <button
                onClick={onUserLogout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenUserAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>User Login</span>
            </button>
          )}

          {/* Order Service CTA */}
          <button
            onClick={() => handleNav('order-service')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Order a Service</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('services')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            Services (10 Categories)
          </button>
          <button
            onClick={() => handleNav('portfolio')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            Portfolio
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('faq')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => handleNav('posts')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            Posts & Guides
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="w-full text-left px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            Contact
          </button>
          <button
            onClick={() => handleNav('track-order')}
            className="w-full text-left px-3 py-2 text-base font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <Package className="h-4 w-4" />
            <span>Track Project Real-Time</span>
          </button>
          {onOpenWorkspace && (
            <button
              onClick={() => {
                onOpenWorkspace();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-base font-bold text-cyan-300 bg-slate-900 border border-cyan-500/30 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Google Workspace (Drive, Gmail, Chat)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
