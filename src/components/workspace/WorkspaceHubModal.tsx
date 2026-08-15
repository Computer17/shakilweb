import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Mail,
  MessageSquare,
  Sparkles,
  Upload,
  Send,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Folder,
  User,
  LogOut,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Search,
  Plus,
} from 'lucide-react';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  fetchDriveFiles,
  uploadFileToDrive,
  fetchGmailMessages,
  sendGmailMessage,
  fetchChatSpaces,
  sendChatMessage,
  DriveFileItem,
  GmailMessageSummary,
  ChatSpaceItem,
} from '../../lib/googleWorkspace';

interface WorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'drive' | 'gmail' | 'chat';
  orderContext?: {
    orderId: string;
    serviceTitle: string;
    clientName: string;
    clientEmail?: string;
  };
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'drive',
  orderContext,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'chat'>(initialTab);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive State
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [uploadFileName, setUploadFileName] = useState(
    orderContext ? `Project_Deliverable_${orderContext.orderId}.txt` : 'Shakil_WorkHub_Report.txt'
  );
  const [uploadContent, setUploadContent] = useState(
    orderContext
      ? `SHAKIL WORKHUB - PROJECT DELIVERY REPORT\nOrder ID: ${orderContext.orderId}\nService: ${orderContext.serviceTitle}\nClient: ${orderContext.clientName}\nStatus: Verified & Delivered\nDate: ${new Date().toLocaleDateString()}`
      : 'Shakil WorkHub verified digital deliverables and project specifications.'
  );
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveSuccessMsg, setDriveSuccessMsg] = useState<string | null>(null);

  // Gmail State
  const [gmailMessages, setGmailMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [emailTo, setEmailTo] = useState(orderContext?.clientEmail || 'm.p.17.lal.2.com@gmail.com');
  const [emailSubject, setEmailSubject] = useState(
    orderContext
      ? `[Shakil WorkHub] Update for Order ${orderContext.orderId} - ${orderContext.serviceTitle}`
      : 'Shakil WorkHub - Project Update & Communication'
  );
  const [emailBody, setEmailBody] = useState(
    orderContext
      ? `Hello ${orderContext.clientName},\n\nThis is an official update regarding your order ${orderContext.orderId} (${orderContext.serviceTitle}).\n\nEverything is progressing smoothly according to our high-quality standard.\n\nBest regards,\nShakil WorkHub Team`
      : 'Hello,\n\nThank you for reaching out to Shakil WorkHub. Let us know if you need any additional IT assistance.\n\nBest regards,\nShakil WorkHub'
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);

  // Google Chat State
  const [chatSpaces, setChatSpaces] = useState<ChatSpaceItem[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatMessageText, setChatMessageText] = useState(
    orderContext
      ? `🚀 Project Milestone: Work for order ${orderContext.orderId} (${orderContext.serviceTitle}) is active and verified!`
      : 'Hello from Shakil WorkHub Workspace integration!'
  );
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatSuccessMsg, setChatSuccessMsg] = useState<string | null>(null);
  const [showChatConfirmModal, setShowChatConfirmModal] = useState(false);

  // Check in-memory token on open
  useEffect(() => {
    if (isOpen) {
      getAccessToken().then((token) => {
        if (token) {
          setAccessToken(token);
        }
      });
    }
  }, [isOpen]);

  // Fetch data when activeTab or token changes
  useEffect(() => {
    if (!accessToken) return;

    if (activeTab === 'drive') {
      loadDriveFiles();
    } else if (activeTab === 'gmail') {
      loadGmailMessages();
    } else if (activeTab === 'chat') {
      loadChatSpaces();
    }
  }, [accessToken, activeTab]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setAccessToken(res.accessToken);
        setGoogleUser(res.user);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setAccessToken(null);
    setGoogleUser(null);
    setDriveFiles([]);
    setGmailMessages([]);
    setChatSpaces([]);
  };

  const loadDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    try {
      const files = await fetchDriveFiles(accessToken, driveSearchQuery || undefined);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleUploadDrive = async () => {
    if (!accessToken) return;
    setIsUploadingDrive(true);
    setDriveSuccessMsg(null);
    try {
      const newFile = await uploadFileToDrive(accessToken, uploadFileName, uploadContent);
      setDriveSuccessMsg(`✓ File "${newFile.name}" successfully created in Google Drive!`);
      loadDriveFiles();
      setTimeout(() => setDriveSuccessMsg(null), 6000);
    } catch (err: any) {
      setAuthError(err.message || 'Drive upload failed');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  const loadGmailMessages = async () => {
    if (!accessToken) return;
    setIsLoadingGmail(true);
    try {
      const msgs = await fetchGmailMessages(accessToken, 8);
      setGmailMessages(msgs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const executeSendEmail = async () => {
    if (!accessToken) return;
    setShowEmailConfirmModal(false);
    setIsSendingEmail(true);
    setEmailSuccessMsg(null);
    try {
      await sendGmailMessage(accessToken, emailTo, emailSubject, emailBody);
      setEmailSuccessMsg(`✓ Email successfully sent to ${emailTo}!`);
      loadGmailMessages();
      setTimeout(() => setEmailSuccessMsg(null), 6000);
    } catch (err: any) {
      setAuthError(err.message || 'Gmail send failed');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const loadChatSpaces = async () => {
    if (!accessToken) return;
    setIsLoadingChat(true);
    try {
      const spaces = await fetchChatSpaces(accessToken);
      setChatSpaces(spaces);
      if (spaces.length > 0 && !selectedSpace) {
        setSelectedSpace(spaces[0].name);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const executeSendChatMessage = async () => {
    if (!accessToken || !selectedSpace) return;
    setShowChatConfirmModal(false);
    setIsSendingChat(true);
    setChatSuccessMsg(null);
    try {
      await sendChatMessage(accessToken, selectedSpace, chatMessageText);
      setChatSuccessMsg('✓ Message successfully posted to Google Chat space!');
      setTimeout(() => setChatSuccessMsg(null), 6000);
    } catch (err: any) {
      setAuthError(err.message || 'Google Chat message failed');
    } finally {
      setIsSendingChat(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Google Workspace Hub</h2>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  Drive • Gmail • Chat
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Directly connect and manage your Google Drive files, Gmail communications, and Google Chat spaces.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'drive'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>Google Drive</span>
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'gmail'
                ? 'border-red-400 text-red-400 bg-red-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Gmail Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'chat'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Google Chat</span>
          </button>
        </div>

        {/* Auth State Banner */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {accessToken ? (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-300 font-semibold">
                  Google Workspace Connected: <strong className="text-white">{googleUser?.email || 'Active Account'}</strong>
                </span>
                <span className="text-[10px] text-emerald-400 block">● In-Memory Secure Bearer Token Active</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Connect with your Google account to access Drive files, Gmail, and Chat spaces with your permission.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {accessToken ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* ================= GOOGLE DRIVE TAB ================= */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              {!accessToken ? (
                <div className="text-center py-12 space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto">
                    <HardDrive className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Google Drive Integration</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Authenticate to view and upload project deliverables, PDF receipts, and client files directly into your Google Drive storage.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Connect Google Drive</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Upload to Drive Section */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-cyan-300">
                        <Upload className="h-4 w-4" />
                        <span>Upload Deliverable / File to Google Drive</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          File Name
                        </label>
                        <input
                          type="text"
                          value={uploadFileName}
                          onChange={(e) => setUploadFileName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          File Content / Specifications
                        </label>
                        <textarea
                          rows={3}
                          value={uploadContent}
                          onChange={(e) => setUploadContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {driveSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{driveSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleUploadDrive}
                        disabled={isUploadingDrive || !uploadFileName}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{isUploadingDrive ? 'Uploading to Drive...' : 'Save to My Google Drive'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Drive Files List */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Your Recent Google Drive Files ({driveFiles.length})</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Filter files..."
                            value={driveSearchQuery}
                            onChange={(e) => setDriveSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
                            className="pl-7 pr-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        <button
                          onClick={loadDriveFiles}
                          disabled={isLoadingDrive}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
                      {isLoadingDrive ? (
                        <div className="p-8 text-center text-xs text-slate-400">Loading Drive files...</div>
                      ) : driveFiles.length > 0 ? (
                        driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-3 hover:bg-slate-900/80 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-semibold text-white block truncate">{file.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Drive Item'}
                                </span>
                              </div>
                            </div>
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 shrink-0"
                              >
                                <span>Open in Drive</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No Google Drive files found. Upload one above to get started!
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= GMAIL TAB ================= */}
          {activeTab === 'gmail' && (
            <div className="space-y-6">
              {!accessToken ? (
                <div className="text-center py-12 space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Gmail Integration</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Authenticate to view your recent communications and send verified email updates and receipts directly from your connected Gmail address.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:from-red-400 hover:to-rose-500 transition-all cursor-pointer"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Connect Gmail</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Compose & Send Email */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-red-300">
                        <Mail className="h-4 w-4" />
                        <span>Send Email via Connected Gmail</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">To</label>
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Message Body</label>
                        <textarea
                          rows={4}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-400 font-sans"
                        />
                      </div>
                    </div>

                    {emailSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{emailSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowEmailConfirmModal(true)}
                        disabled={isSendingEmail || !emailTo || !emailSubject}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-red-500/20"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send with Confirmation</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Gmail Messages */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-red-400" />
                        <span>Recent Gmail Inbox Messages ({gmailMessages.length})</span>
                      </h4>
                      <button
                        onClick={loadGmailMessages}
                        disabled={isLoadingGmail}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingGmail ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
                      {isLoadingGmail ? (
                        <div className="p-8 text-center text-xs text-slate-400">Loading messages from Gmail...</div>
                      ) : gmailMessages.length > 0 ? (
                        gmailMessages.map((msg) => (
                          <div key={msg.id} className="p-3.5 hover:bg-slate-900/80 transition-colors space-y-1 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-white truncate max-w-xs">{msg.subject}</span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">{msg.date}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{msg.snippet || 'No preview available'}</p>
                            <span className="text-[10px] text-slate-500 font-mono block">From: {msg.from}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No recent messages found or permissions pending.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= GOOGLE CHAT TAB ================= */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              {!accessToken ? (
                <div className="text-center py-12 space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Google Chat Spaces Integration</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Authenticate with Google to broadcast project status updates and milestone notices to your Google Chat spaces.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all cursor-pointer"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Connect Google Chat</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                        <MessageSquare className="h-4 w-4" />
                        <span>Send Message to Google Chat Space</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Select Chat Space
                        </label>
                        {chatSpaces.length > 0 ? (
                          <select
                            value={selectedSpace}
                            onChange={(e) => setSelectedSpace(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                          >
                            {chatSpaces.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.displayName || s.name} ({s.spaceType || 'Space'})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                            <span>No active Chat spaces found for this account.</span>
                            <button
                              onClick={loadChatSpaces}
                              className="text-cyan-400 font-bold hover:underline"
                            >
                              Refresh
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Chat Message Content
                        </label>
                        <textarea
                          rows={3}
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400 font-sans"
                        />
                      </div>
                    </div>

                    {chatSuccessMsg && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{chatSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowChatConfirmModal(true)}
                        disabled={isSendingChat || !selectedSpace || !chatMessageText}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Post to Chat Space</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Protected with client-side Google OAuth 2.0 & Firebase Auth</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Explicit User Confirmation Modal for Sending Email */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-red-500/50 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Sending Email</h3>
                <p className="text-xs text-slate-400">Please review before sending via Gmail.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div>
                <strong className="text-slate-400">Recipient:</strong>{' '}
                <span className="text-white">{emailTo}</span>
              </div>
              <div>
                <strong className="text-slate-400">Subject:</strong>{' '}
                <span className="text-white">{emailSubject}</span>
              </div>
              <div>
                <strong className="text-slate-400">Body Preview:</strong>
                <p className="text-slate-300 text-[11px] line-clamp-2 mt-0.5">{emailBody}</p>
              </div>
            </div>

            <p className="text-[11px] text-amber-300">
              ⚠️ This will send an actual email from your connected Google account.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEmailConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendEmail}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Yes, Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit User Confirmation Modal for Posting Chat Message */}
      {showChatConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/50 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Post to Google Chat</h3>
                <p className="text-xs text-slate-400">Post update to the selected space.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div>
                <strong className="text-slate-400">Target Space:</strong>{' '}
                <span className="text-emerald-300 font-mono">{selectedSpace}</span>
              </div>
              <div>
                <strong className="text-slate-400">Message:</strong>
                <p className="text-slate-300 text-[11px] line-clamp-3 mt-0.5">{chatMessageText}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChatConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendChatMessage}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Confirm & Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
