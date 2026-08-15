import React, { useState } from 'react';
import { ServiceItem, OrderRequest, OrderFile } from '../../types';
import { OrderTimeline } from '../common/OrderTimeline';
import { generateOrderPdf } from '../../utils/pdfGenerator';
import {
  X,
  Upload,
  File,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Download,
  FileText,
} from 'lucide-react';

interface OrderFlowModalProps {
  services: ServiceItem[];
  preselectedServiceId?: string;
  initialContext?: string;
  onClose: () => void;
  onOrderCreated?: (order: OrderRequest) => void;
}

export const OrderFlowModal: React.FC<OrderFlowModalProps> = ({
  services,
  preselectedServiceId,
  initialContext,
  onClose,
  onOrderCreated,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || services[0]?.id || 'pdf-to-word'
  );
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [contactPlatform, setContactPlatform] = useState<'whatsapp' | 'telegram' | 'messenger' | 'email'>('whatsapp');
  const [requirements, setRequirements] = useState(initialContext || '');
  const [budget, setBudget] = useState('');
  const [requestedDelivery, setRequestedDelivery] = useState('24 Hours');

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<OrderFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Result state
  const [createdOrder, setCreatedOrder] = useState<OrderRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Handle File Selection and Upload to Server Endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.files) {
        setUploadedFiles((prev) => [...prev, ...data.files]);
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Submit Order Request
  const handleSubmit = async () => {
    if (!clientName.trim()) {
      alert('Please enter your name.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          contactPlatform,
          serviceId: selectedService.id,
          serviceTitle: selectedService.title,
          requirements: requirements || `Order request for ${selectedService.title}`,
          files: uploadedFiles,
          budget: budget || (selectedService.pricingType === 'fixed' ? `৳${selectedService.priceAmount}` : 'Discussion Based'),
          requestedDelivery: requestedDelivery || selectedService.estimatedDelivery,
          aiConversationSummary: initialContext || `Client submitted request for ${selectedService.title}.`,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        setCreatedOrder(data.order);
        if (onOrderCreated) onOrderCreated(data.order);
        setStep(5); // Show Confirmation & Share
      }
    } catch (err) {
      alert('Order submission failed. Please try again or contact Shakil via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preformatted Order Summary for Deep Linking (Section 14 & 15)
  const getFormattedOrderSummary = () => {
    if (!createdOrder) return '';

    return `ORDER REQUEST

Order ID: ${createdOrder.id}
Client: ${createdOrder.clientName}
Service: ${createdOrder.serviceTitle}
Files: ${createdOrder.fileCount} file(s) attached
Requirements: ${createdOrder.requirements}
Budget: ${createdOrder.budget}
Requested Delivery: ${createdOrder.requestedDelivery}

AI Conversation Summary: "${createdOrder.aiConversationSummary}"

Status: ${createdOrder.status} (Ready for Review)`;
  };

  const summaryText = getFormattedOrderSummary();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  // WhatsApp deep link
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;

  // Telegram deep link
  const telegramUrl = `https://t.me/share/url?url=https://workhub.app&text=${encodeURIComponent(
    summaryText
  )}`;

  // Messenger deep link
  const messengerUrl = `https://m.me/`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Honest & Clear Order Process</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {step === 5 ? 'Request Received ✅' : 'Order a Service from Shakil'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {step === 5
              ? 'Your request is now under 10–15 minute review by Shakil.'
              : 'Fill in your task details. No payment is charged prior to order confirmation.'}
          </p>
        </div>

        {/* Step Indicator */}
        {step < 5 && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              className={`py-1.5 rounded-lg border font-semibold ${
                step >= 1 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              1. Service
            </div>
            <div
              className={`py-1.5 rounded-lg border font-semibold ${
                step >= 2 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              2. Details
            </div>
            <div
              className={`py-1.5 rounded-lg border font-semibold ${
                step >= 3 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              3. Files
            </div>
            <div
              className={`py-1.5 rounded-lg border font-semibold ${
                step >= 4 ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-800 text-slate-500'
              }`}
            >
              4. Review
            </div>
          </div>
        )}

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-300">
              Select Desired Service:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    selectedServiceId === s.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-white ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm text-cyan-400">{s.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{s.shortIntro}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-1.5">
                    <span>Est: {s.estimatedDelivery}</span>
                    <span className="font-bold text-slate-300">
                      {s.pricingType === 'fixed' ? `৳${s.priceAmount}` : 'Discussion'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <span>Continue to Requirements</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Requirements & Contact */}
        {step === 2 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+8801700000000"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Task Requirements & Instructions:
              </label>
              <textarea
                rows={4}
                placeholder="Describe your project, page count, formatting rules, or special requests clearly..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (!clientName.trim()) return alert('Please enter your name.');
                  setStep(3);
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <span>Continue to File Upload</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: File Upload & Budget */}
        {step === 3 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Required Document(s) (PDF, DOCX, XLSX, Images, ZIP):
              </label>

              {/* Upload Drop Zone */}
              <div className="relative border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/60 hover:border-cyan-500/50 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-300">
                  Click or drag files here to attach
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, JPG, PNG, WEBP, ZIP (Max 25MB)
                </p>
              </div>

              {uploading && (
                <p className="text-xs text-cyan-400 italic mt-2 animate-pulse">Uploading files...</p>
              )}

              {/* Uploaded File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">Attached Files:</span>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <File className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Budget (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., ৳500 or $15"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Requested Delivery Timeline:
                </label>
                <select
                  value={requestedDelivery}
                  onChange={(e) => setRequestedDelivery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="6 Hours">6 Hours (Urgent)</option>
                  <option value="12 Hours">12 Hours</option>
                  <option value="24 Hours">24 Hours (Standard)</option>
                  <option value="48 Hours">48 Hours</option>
                  <option value="3-5 Days">3-5 Days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <span>Review Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Order Summary Review */}
        {step === 4 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Selected Service:</span>
                <span className="font-bold text-cyan-400">{selectedService.title}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Client Name:</span>
                <span className="font-semibold text-white">{clientName}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Contact Details:</span>
                <span className="text-slate-200">{clientPhone || clientEmail || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Attached Files:</span>
                <span className="font-semibold text-emerald-400">{uploadedFiles.length} file(s)</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Estimated Delivery:</span>
                <span className="text-slate-200">{requestedDelivery}</span>
              </div>

              <div className="pt-1">
                <span className="text-xs text-slate-400 block mb-1">Requirements Summary:</span>
                <p className="text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {requirements || 'Standard requirements as discussed.'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">10–15 Minute Review Guarantee</p>
                <p className="text-[11px] text-emerald-300/80">
                  Your request is reviewed directly by Shakil before acceptance. No charges prior to agreement.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {submitting ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit Request to Shakil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Request Received Notice & Context Sharing (Section 11, 14, 15) */}
        {step === 5 && createdOrder && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Real-time Order Progress Timeline */}
            <OrderTimeline
              status={createdOrder.status}
              orderId={createdOrder.id}
              serviceTitle={selectedService.title}
              estimatedCompletion={requestedDelivery}
            />

            {/* Status Card */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Request Received ✅
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                Your request has been successfully received. Order ID: <strong className="text-cyan-300">{createdOrder.id}</strong>
                <br />
                Your request is now being reviewed by Shakil.
                <br />
                <span className="font-semibold text-emerald-400">
                  Please allow approximately 10–15 minutes.
                </span>
                <br />
                You will be informed when the next step is ready.
              </p>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => generateOrderPdf(createdOrder)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Summary PDF</span>
                </button>
              </div>
            </div>

            {/* Order Context Summary Sharing (Section 14 & 15) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span>Send Order Summary to Shakil</span>
                </h4>
                <button
                  onClick={handleCopySummary}
                  className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedText ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40">
                {summaryText}
              </pre>

              {/* Direct Deep Link Action Buttons (Section 15) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-3 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/40 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>💬 Send to WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-sky-600/20 border border-sky-500/40 px-3 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-600/40 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>✈️ Send to Telegram</span>
                </a>

                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/40 px-3 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-600/40 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>💙 Send to Messenger</span>
                </a>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Close Order Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
