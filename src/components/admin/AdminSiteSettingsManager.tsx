import React, { useState, useEffect } from 'react';
import {
  Globe,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Save,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Briefcase,
  Upload,
  AlertCircle,
  FileText,
  Download,
  Eye,
  FolderOpen,
  FileSpreadsheet,
  FileArchive,
  RefreshCw,
  Search,
  Grid,
  List,
  HardDrive,
  ExternalLink,
  X,
} from 'lucide-react';
import { ServiceItem, PortfolioItem, SiteSettings } from '../../types';

interface AdminSiteSettingsManagerProps {
  settings: SiteSettings;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  onSaveSettings: (newSettings: SiteSettings) => Promise<void>;
  onUpdateServices: (services: ServiceItem[]) => Promise<void>;
  onUpdatePortfolio: (portfolio: PortfolioItem[]) => Promise<void>;
}

export const AdminSiteSettingsManager: React.FC<AdminSiteSettingsManagerProps> = ({
  settings,
  services,
  portfolio,
  onSaveSettings,
  onUpdateServices,
  onUpdatePortfolio,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'whatsapp_gateway' | 'services' | 'portfolio' | 'files'>('contacts');

  // WhatsApp Gateway Tester State
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);
  const [testPhone, setTestPhone] = useState('01890193985');
  const [testName, setTestName] = useState('Shakil Admin');
  const [testOtpLoading, setTestOtpLoading] = useState(false);
  const [testOtpResult, setTestOtpResult] = useState<any>(null);

  // Contact & Site Settings State
  const [formSettings, setFormSettings] = useState<SiteSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Services Edit State
  const [servicesList, setServicesList] = useState<ServiceItem[]>(services);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewService, setIsNewService] = useState(false);

  // Portfolio Edit State
  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(portfolio);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [isNewPortfolio, setIsNewPortfolio] = useState(false);

  // Files Repository State
  const [uploadedFilesList, setUploadedFilesList] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesSearchQuery, setFilesSearchQuery] = useState('');
  const [filesCategoryFilter, setFilesCategoryFilter] = useState<'all' | 'images' | 'docs' | 'sheets' | 'other'>('all');
  const [fileViewMode, setFileViewMode] = useState<'grid' | 'table'>('grid');
  const [previewingFile, setPreviewingFile] = useState<any | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [uploadingAdminFile, setUploadingAdminFile] = useState(false);

  const fetchFilesList = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/admin/files');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          setUploadedFilesList(data.files);
        }
      }
    } catch (err) {
      console.error('Error fetching uploaded files:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchGatewayStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus(data);
      }
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'files') {
      fetchFilesList();
    } else if (activeSubTab === 'whatsapp_gateway') {
      fetchGatewayStatus();
    }
  }, [activeSubTab]);

  const handleSendTestWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setTestOtpLoading(true);
    setTestOtpResult(null);

    try {
      const res = await fetch('/api/user/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: testPhone.trim(),
          name: testName.trim(),
          mode: 'login',
          countryCode: '+880',
        }),
      });
      const data = await res.json();
      setTestOtpResult(data);
    } catch (err: any) {
      setTestOtpResult({
        success: false,
        message: err.message || 'Failed to dispatch test OTP',
      });
    } finally {
      setTestOtpLoading(false);
    }
  };

  const handleDeleteFile = async (file: any) => {
    const filename = file.filename || file.id;
    if (!confirm(`Are you sure you want to permanently delete '${file.name}'?`)) return;

    setDeletingFileId(filename);
    try {
      const res = await fetch(`/api/admin/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFilesList((prev) => prev.filter((f) => f.id !== file.id && f.filename !== filename));
        if (previewingFile?.id === file.id || previewingFile?.filename === filename) {
          setPreviewingFile(null);
        }
      } else {
        alert(data.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAdminFile(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchFilesList();
      } else {
        alert('File upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file');
    } finally {
      setUploadingAdminFile(false);
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType: string = '', filename: string = '') => {
    const lower = (fileType + ' ' + filename).toLowerCase();
    if (lower.includes('image') || lower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
      return <ImageIcon className="h-6 w-6 text-emerald-400" />;
    }
    if (lower.includes('pdf') || lower.endsWith('.pdf')) {
      return <FileText className="h-6 w-6 text-rose-400" />;
    }
    if (lower.includes('excel') || lower.includes('spreadsheet') || lower.match(/\.(xls|xlsx|csv)$/)) {
      return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
    }
    if (lower.includes('word') || lower.match(/\.(doc|docx)$/)) {
      return <FileText className="h-6 w-6 text-sky-400" />;
    }
    if (lower.includes('zip') || lower.match(/\.(zip|rar|7z|tar|gz)$/)) {
      return <FileArchive className="h-6 w-6 text-amber-400" />;
    }
    return <FolderOpen className="h-6 w-6 text-cyan-400" />;
  };

  // Save Site Settings Handler
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onSaveSettings(formSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Image File Upload helper
  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.files && data.files[0]) {
        callback(data.files[0].url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  // Service Save Handler
  const handleSaveService = async (serviceToSave: ServiceItem) => {
    let updated: ServiceItem[];
    if (isNewService) {
      updated = [serviceToSave, ...servicesList];
    } else {
      updated = servicesList.map((s) => (s.id === serviceToSave.id ? serviceToSave : s));
    }

    setServicesList(updated);
    await onUpdateServices(updated);
    setEditingService(null);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    const updated = servicesList.filter((s) => s.id !== id);
    setServicesList(updated);
    await onUpdateServices(updated);
  };

  // Portfolio Save Handler
  const handleSavePortfolioItem = async (itemToSave: PortfolioItem) => {
    let updated: PortfolioItem[];
    if (isNewPortfolio) {
      updated = [itemToSave, ...portfolioList];
    } else {
      updated = portfolioList.map((p) => (p.id === itemToSave.id ? itemToSave : p));
    }

    setPortfolioList(updated);
    await onUpdatePortfolio(updated);
    setEditingPortfolio(null);
  };

  const handleDeletePortfolioItem = async (id: string) => {
    if (!confirm('Delete this portfolio item?')) return;
    const updated = portfolioList.filter((p) => p.id !== id);
    setPortfolioList(updated);
    await onUpdatePortfolio(updated);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-2 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('contacts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'contacts'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Website & Contacts CMS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('whatsapp_gateway');
            fetchGatewayStatus();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'whatsapp_gateway'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4 text-emerald-400" />
          <span>WhatsApp OTP & Vercel API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'services'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Services Manager ({servicesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('portfolio')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'portfolio'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Portfolio Items ({portfolioList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('files');
            fetchFilesList();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'files'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Uploaded Files ({uploadedFilesList.length})</span>
        </button>
      </div>

      {/* TAB 1: WEBSITE & CONTACT SETTINGS */}
      {activeSubTab === 'contacts' && (
        <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
          {/* Admin Contact Info Section */}
          <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Admin Contact Info Management</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      Live Dynamic
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dynamically update the WhatsApp number, Telegram username, helpline phone number, and official admin email shown across the entire website.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-in fade-in shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Changes Saved Successfully!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* WhatsApp Field */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-white">WhatsApp Official Number</label>
                  <a
                    href={`https://wa.me/88${formSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Test WhatsApp Link</span>
                    <Send className="h-3 w-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formSettings.whatsappNumber}
                    onChange={(e) => setFormSettings({ ...formSettings, whatsappNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3 py-2.5 text-xs font-mono text-emerald-300 font-bold focus:border-cyan-500 focus:outline-none"
                    placeholder="01890193985"
                  />
                  <MessageSquare className="h-4 w-4 text-emerald-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Appears in header bar, contact page, and order submission confirmation windows.
                </p>
              </div>

              {/* Telegram Field */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-white">Telegram Username</label>
                  <a
                    href={`https://t.me/${formSettings.telegramUsername.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Test Telegram Link</span>
                    <Send className="h-3 w-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formSettings.telegramUsername}
                    onChange={(e) => setFormSettings({ ...formSettings, telegramUsername: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3 py-2.5 text-xs font-mono text-sky-300 font-bold focus:border-cyan-500 focus:outline-none"
                    placeholder="@DarkPrince_Dev"
                  />
                  <Send className="h-4 w-4 text-sky-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Include "@" prefix (e.g. @DarkPrince_Dev). Direct link opens Telegram chat.
                </p>
              </div>

              {/* Helpline Phone Field */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-white">Helpline / Hotline Phone</label>
                  <a
                    href={`tel:${formSettings.helplinePhone}`}
                    className="text-[10px] text-cyan-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Test Call Link</span>
                    <Phone className="h-3 w-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formSettings.helplinePhone}
                    onChange={(e) => setFormSettings({ ...formSettings, helplinePhone: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                    placeholder="+8809646175520"
                  />
                  <Phone className="h-4 w-4 text-cyan-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Hotline number displayed in site header and phone support sections.
                </p>
              </div>

              {/* Admin Email Field */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-white">Official Admin Email</label>
                  <a
                    href={`mailto:${formSettings.adminEmail}`}
                    className="text-[10px] text-indigo-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Test Email Link</span>
                    <Mail className="h-3 w-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={formSettings.adminEmail}
                    onChange={(e) => setFormSettings({ ...formSettings, adminEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-3 py-2.5 text-xs font-mono text-indigo-300 font-bold focus:border-cyan-500 focus:outline-none"
                    placeholder="m.p.17.lal.2.com@gmail.com"
                  />
                  <Mail className="h-4 w-4 text-indigo-400 absolute left-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Receives system notifications and client order emails.
                </p>
              </div>
            </div>
          </div>

          {/* Website Branding & Headlines Section */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Website Branding & Banners</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Website Brand Title</label>
                <input
                  type="text"
                  value={formSettings.siteTitle}
                  onChange={(e) => setFormSettings({ ...formSettings, siteTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={formSettings.heroHeadline}
                  onChange={(e) => setFormSettings({ ...formSettings, heroHeadline: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hero Sub-headline</label>
                <textarea
                  rows={2}
                  value={formSettings.heroSubheadline}
                  onChange={(e) => setFormSettings({ ...formSettings, heroSubheadline: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Top Announcement Bar Text</label>
                <input
                  type="text"
                  value={formSettings.announcementText}
                  onChange={(e) => setFormSettings({ ...formSettings, announcementText: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Save className="h-4 w-4" />
                <span>{savingSettings ? 'Saving Admin Contact & Site Settings...' : 'Save All Admin Contact & Site Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB: WHATSAPP OTP GATEWAY & VERCEL DEPLOYMENT CONFIG */}
      {activeSubTab === 'whatsapp_gateway' && (
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>WhatsApp OTP Gateway & Vercel API Hub</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      v2.4 Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Twilio WhatsApp Business API & Meta WhatsApp Cloud API integration with Vercel deployment support.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchGatewayStatus}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700 shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Twilio Status */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">1. Twilio WhatsApp API</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    gatewayStatus?.twilioConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {gatewayStatus?.twilioConfigured ? '✓ Active Connected' : 'Auto Sandbox Mode'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sends automated SMS/WhatsApp OTP from registered Twilio sender: <code className="text-cyan-400 font-mono">{gatewayStatus?.twilioNumber || 'whatsapp:+14155238886'}</code>
                </p>
              </div>

              {/* Meta Cloud API Status */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">2. Meta Cloud API</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    gatewayStatus?.cloudApiConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {gatewayStatus?.cloudApiConfigured ? '✓ Configured' : 'Optional (Env)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct Meta Graph API v19+ token & phone number ID for WhatsApp Business Cloud API.
                </p>
              </div>

              {/* WhatsApp Interactive Link */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300">3. Direct wa.me Gateway</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    ✓ Always Ready (100%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant deep links & 1-click verification link with Shakil Official WhatsApp (<code className="text-emerald-400 font-mono">01890193985</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Test Live OTP Sender */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              <span>Live Test WhatsApp OTP Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter any WhatsApp phone number below to test the live OTP generation, Twilio/Meta integration, and deep-link generation.
            </p>

            <form onSubmit={handleSendTestWhatsAppOtp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Phone Number</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="01890193985 or +8801890193985"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Shakil Test"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={testOtpLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {testOtpLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Dispatch Test WhatsApp OTP</span>
                </button>
              </div>
            </form>

            {testOtpResult && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Test OTP Dispatched: <strong>{testOtpResult.otpCode}</strong></span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Provider: {testOtpResult.provider}</span>
                </div>
                <p className="text-xs text-slate-300">{testOtpResult.message}</p>
                {testOtpResult.directChatUrl && (
                  <a
                    href={testOtpResult.directChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-bold"
                  >
                    <span>Open Pre-filled WhatsApp Message</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Vercel Deployment & Database Documentation */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Vercel.com Hosting & Database Setup Guide</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                This project has been fully configured for seamless 1-click deployment on <strong>Vercel (vercel.com)</strong>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>1. Vercel Configuration Included</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li><code className="text-cyan-400">vercel.json</code> auto-routes API and static frontend.</li>
                    <li><code className="text-cyan-400">api/index.ts</code> handles Express endpoints serverlessly.</li>
                    <li><code className="text-cyan-400">data/database.json</code> persistent local/serverless database.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                    <span>2. Environment Variables for Vercel</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li><code className="text-emerald-400">TWILIO_ACCOUNT_SID</code> (Twilio WhatsApp)</li>
                    <li><code className="text-emerald-400">TWILIO_AUTH_TOKEN</code> (Twilio Auth Token)</li>
                    <li><code className="text-emerald-400">TWILIO_WHATSAPP_NUMBER</code> (e.g. whatsapp:+14155238886)</li>
                    <li><code className="text-cyan-400">GEMINI_API_KEY</code> & <code className="text-cyan-400">ADMIN_PASSWORD</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES MANAGER */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">All Offered Services</h3>
              <p className="text-xs text-slate-400">
                Change service names, pricing, descriptions, icons, and image attachments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsNewService(true);
                setEditingService({
                  id: 'srv-' + Date.now(),
                  slug: 'new-service-' + Date.now(),
                  title: 'New Custom Service',
                  shortIntro: 'Short introductory description',
                  fullExplanation: 'Full details of what is included and how work is delivered.',
                  included: ['Requirement analysis', 'High quality execution', 'Revisions included'],
                  notIncluded: ['Out-of-scope requests'],
                  requiredFiles: ['Input files/PDFs'],
                  requiredInfo: ['Detailed instructions'],
                  estimatedDelivery: '24 Hours',
                  pricingType: 'discussion',
                  category: 'Digital Work',
                  iconName: 'Layers',
                  examples: [],
                  faqs: [],
                });
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Edit / Create Service Modal/Form */}
          {editingService && (
            <div className="p-6 rounded-3xl border border-cyan-500/40 bg-slate-900 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-extrabold text-cyan-400">
                  {isNewService ? 'Create New Service' : `Edit Service: ${editingService.title}`}
                </h4>
                <button
                  onClick={() => setEditingService(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Service Title</label>
                  <input
                    type="text"
                    value={editingService.title}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={editingService.estimatedDelivery}
                    onChange={(e) => setEditingService({ ...editingService, estimatedDelivery: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="24-48 Hours"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price / Budget</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editingService.priceAmount || ''}
                      onChange={(e) => setEditingService({ ...editingService, priceAmount: Number(e.target.value) })}
                      className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                      placeholder="Amount (e.g. 1500)"
                    />
                    <select
                      value={editingService.pricingType}
                      onChange={(e) => setEditingService({ ...editingService, pricingType: e.target.value as any })}
                      className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-slate-100"
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="discussion">Discussion Based</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Short Intro</label>
                  <input
                    type="text"
                    value={editingService.shortIntro}
                    onChange={(e) => setEditingService({ ...editingService, shortIntro: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Full Detailed Description</label>
                  <textarea
                    rows={3}
                    value={editingService.fullExplanation}
                    onChange={(e) => setEditingService({ ...editingService, fullExplanation: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveService(editingService)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </div>
          )}

          {/* Service Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((srv) => (
              <div key={srv.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      {srv.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1">{srv.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsNewService(false);
                        setEditingService(srv);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                      title="Edit Service"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-rose-900/50 text-rose-400 hover:bg-rose-950"
                      title="Delete Service"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{srv.shortIntro}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                  <span className="text-emerald-400 font-bold">
                    {srv.pricingType === 'fixed' && srv.priceAmount
                      ? `৳${srv.priceAmount}`
                      : 'Discussion Based'}
                  </span>
                  <span className="text-slate-400">{srv.estimatedDelivery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PORTFOLIO MANAGER */}
      {activeSubTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white">Portfolio Items & Showcase Work</h3>
              <p className="text-xs text-slate-400">
                Add screenshots, client feedback, descriptions, and results of past completed work.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsNewPortfolio(true);
                setEditingPortfolio({
                  id: 'port-' + Date.now(),
                  title: 'Sample E-commerce / Data Task',
                  description: 'High quality completed client project result.',
                  category: 'Websites',
                  previewUrl: '',
                  tools: ['React', 'Excel', 'Photoshop'],
                  date: new Date().toISOString().split('T')[0],
                  result: '100% Accuracy Delivered',
                  verified: true,
                });
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add Portfolio Item</span>
            </button>
          </div>

          {/* Edit / Create Portfolio Form */}
          {editingPortfolio && (
            <div className="p-6 rounded-3xl border border-cyan-500/40 bg-slate-900 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-sm font-extrabold text-cyan-400">
                  {isNewPortfolio ? 'Add New Portfolio Work' : `Edit Portfolio: ${editingPortfolio.title}`}
                </h4>
                <button onClick={() => setEditingPortfolio(null)} className="text-xs text-slate-400 hover:text-white">
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={editingPortfolio.title}
                    onChange={(e) => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={editingPortfolio.category}
                    onChange={(e) => setEditingPortfolio({ ...editingPortfolio, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="Websites">Websites</option>
                    <option value="Automation">Automation</option>
                    <option value="Data Work">Data Work</option>
                    <option value="PDF/Word/Excel">PDF/Word/Excel</option>
                    <option value="Image Work">Image Work</option>
                    <option value="Product Listing">Product Listing</option>
                    <option value="Research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Result Summary</label>
                  <input
                    type="text"
                    value={editingPortfolio.result}
                    onChange={(e) => setEditingPortfolio({ ...editingPortfolio, result: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="e.g. 500+ items reformatted without errors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Preview Image URL or File</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingPortfolio.previewUrl || ''}
                      onChange={(e) => setEditingPortfolio({ ...editingPortfolio, previewUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100"
                      placeholder="https://..."
                    />
                    <label className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0 flex items-center justify-center">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => setEditingPortfolio({ ...editingPortfolio, previewUrl: url }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Project Description</label>
                  <textarea
                    rows={2}
                    value={editingPortfolio.description}
                    onChange={(e) => setEditingPortfolio({ ...editingPortfolio, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPortfolio(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePortfolioItem(editingPortfolio)}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 cursor-pointer"
                >
                  Save Portfolio Item
                </button>
              </div>
            </div>
          )}

          {/* Portfolio List Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {portfolioList.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                {item.previewUrl && (
                  <img
                    src={item.previewUrl}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-xl border border-slate-800"
                  />
                )}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-white">{item.title}</h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsNewPortfolio(false);
                        setEditingPortfolio(item);
                      }}
                      className="p-1 rounded bg-slate-900 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePortfolioItem(item.id)}
                      className="p-1 rounded bg-slate-900 text-rose-400 hover:bg-rose-950"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {item.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT FILES REPOSITORY */}
      {activeSubTab === 'files' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Client Uploaded Files Gallery</span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                      {uploadedFilesList.length} Files
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage, download, preview, or delete attachments and files uploaded by clients during project order placement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20">
                  <Upload className="h-4 w-4" />
                  <span>{uploadingAdminFile ? 'Uploading...' : 'Upload Test File'}</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleAdminFileUpload}
                    disabled={uploadingAdminFile}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={fetchFilesList}
                  disabled={loadingFiles}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Refresh File List"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter & Controls Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={filesSearchQuery}
                  onChange={(e) => setFilesSearchQuery(e.target.value)}
                  placeholder="Search files by name, client, or order ID..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                {filesSearchQuery && (
                  <button
                    onClick={() => setFilesSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filters */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilesCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filesCategoryFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilesCategoryFilter('images')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filesCategoryFilter === 'images'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilesCategoryFilter('docs')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filesCategoryFilter === 'docs'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Docs
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilesCategoryFilter('sheets')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      filesCategoryFilter === 'sheets'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sheets
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFileViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      fileViewMode === 'grid'
                        ? 'bg-slate-800 text-cyan-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Grid Gallery View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileViewMode('table')}
                    className={`p-1.5 rounded-lg transition-all ${
                      fileViewMode === 'table'
                        ? 'bg-slate-800 text-cyan-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Table List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingFiles ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
              <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Scanning client files repository...</p>
            </div>
          ) : uploadedFilesList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
              <FolderOpen className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">No Uploaded Files Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When clients submit order requests with PDF, Word, Excel, or Image attachments, they will automatically appear here.
              </p>
            </div>
          ) : (
            (() => {
              const filtered = uploadedFilesList.filter((f) => {
                const query = filesSearchQuery.toLowerCase().trim();
                const nameMatch = (f.name || '').toLowerCase().includes(query) || (f.filename || '').toLowerCase().includes(query);
                const clientMatch = (f.clientName || '').toLowerCase().includes(query);
                const orderMatch = (f.orderId || '').toLowerCase().includes(query);
                const serviceMatch = (f.serviceTitle || '').toLowerCase().includes(query);
                const matchesSearch = !query || nameMatch || clientMatch || orderMatch || serviceMatch;

                if (!matchesSearch) return false;

                if (filesCategoryFilter === 'images') {
                  return (f.type || '').includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name || f.filename || '');
                }
                if (filesCategoryFilter === 'docs') {
                  return (f.type || '').includes('pdf') || (f.type || '').includes('msword') || /\.(pdf|doc|docx|txt)$/i.test(f.name || f.filename || '');
                }
                if (filesCategoryFilter === 'sheets') {
                  return (f.type || '').includes('excel') || /\.(xls|xlsx|csv)$/i.test(f.name || f.filename || '');
                }
                if (filesCategoryFilter === 'other') {
                  const isImg = (f.type || '').includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name || f.filename || '');
                  const isDoc = (f.type || '').includes('pdf') || (f.type || '').includes('msword') || /\.(pdf|doc|docx|txt)$/i.test(f.name || f.filename || '');
                  const isSheet = (f.type || '').includes('excel') || /\.(xls|xlsx|csv)$/i.test(f.name || f.filename || '');
                  return !isImg && !isDoc && !isSheet;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-10 text-center rounded-3xl border border-slate-800 bg-slate-900/60">
                    <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">No files match your search criteria.</p>
                  </div>
                );
              }

              return fileViewMode === 'grid' ? (
                /* GRID GALLERY VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((file) => {
                    const isImage = (file.type || '').includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name || file.filename || '');

                    return (
                      <div
                        key={file.id || file.filename}
                        className="group relative rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 hover:border-cyan-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-lg"
                      >
                        {/* File Thumbnail Preview */}
                        <div className="relative w-full h-36 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-center overflow-hidden">
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="p-4 text-center space-y-2">
                              <div className="p-3 rounded-2xl bg-slate-800 inline-block">
                                {getFileIcon(file.type, file.name)}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono font-bold truncate max-w-[140px]">
                                {file.type || 'FILE'}
                              </p>
                            </div>
                          )}

                          {/* Quick Action Overlay */}
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isImage && (
                              <button
                                onClick={() => setPreviewingFile(file)}
                                className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
                                title="Preview Image"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <a
                              href={file.url}
                              download={file.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-md"
                              title="Download File"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file)}
                              disabled={deletingFileId === (file.filename || file.id)}
                              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
                              title="Delete File"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="space-y-1.5 flex-1 pt-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate max-w-[170px]" title={file.name}>
                              {file.name}
                            </h4>
                            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                              {formatFileSize(file.size)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 space-y-0.5">
                            <p className="flex items-center gap-1 text-slate-300">
                              <span className="font-semibold text-slate-400">Client:</span>
                              <span className="text-cyan-300 font-bold truncate max-w-[130px]">{file.clientName || 'Direct'}</span>
                            </p>
                            <p className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <span>Order:</span>
                              <span className="font-mono text-slate-300">{file.orderId || 'N/A'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file)}
                              disabled={deletingFileId === (file.filename || file.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE LIST VIEW */
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-x-auto shadow-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-4 py-3">File / Preview</th>
                        <th className="px-4 py-3">Name & Size</th>
                        <th className="px-4 py-3">Client / Service</th>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Upload Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filtered.map((file) => {
                        const isImage = (file.type || '').includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name || file.filename || '');

                        return (
                          <tr key={file.id || file.filename} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                {isImage ? (
                                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                ) : (
                                  getFileIcon(file.type, file.name)
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <p className="font-bold text-white max-w-xs truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-[10px] font-mono text-cyan-400 font-bold">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-0.5">
                                <p className="text-slate-200 font-bold">{file.clientName || 'Direct'}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-xs">{file.serviceTitle || 'Attachment'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-300">
                              {file.orderId || 'General'}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[11px]">
                              {new Date(file.uploadedAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isImage && (
                                  <button
                                    onClick={() => setPreviewingFile(file)}
                                    className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-cyan-400 hover:bg-slate-800"
                                    title="Preview"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <a
                                  href={file.url}
                                  download={file.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(file)}
                                  disabled={deletingFileId === (file.filename || file.id)}
                                  className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/30 hover:bg-rose-900 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}

          {/* Full Resolution Image Preview Modal */}
          {previewingFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
              <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-md">{previewingFile.name}</h3>
                    <p className="text-[10px] text-cyan-400 font-mono font-bold">
                      {formatFileSize(previewingFile.size)} • Client: {previewingFile.clientName || 'Direct'}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewingFile(null)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-2">
                  <img
                    src={previewingFile.url}
                    alt={previewingFile.name}
                    className="max-h-[55vh] max-w-full object-contain rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={previewingFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    <a
                      href={previewingFile.url}
                      download={previewingFile.name}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download File</span>
                    </a>
                    <button
                      onClick={() => handleDeleteFile(previewingFile)}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete File</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
