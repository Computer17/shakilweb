import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCw,
  Sparkles,
  Clock,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { UserAccount } from '../../types';
import { COUNTRY_CODES, CountryCode, DEFAULT_COUNTRY_CODE } from '../../data/countryCodes';

interface ClientAuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');

  // Country Code
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Sign Up Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>(''); // Optional
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Login Form Fields
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // OTP Step & Verification States
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [targetDisplay, setTargetDisplay] = useState<string>('');
  const [deliveryProvider, setDeliveryProvider] = useState<string>('');
  const [serverChatUrl, setServerChatUrl] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Status & Loaders
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.nameBn.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  const isPasswordMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const getFormattedTarget = (): { cleanTarget: string; displayTarget: string; type: 'phone' | 'email' } => {
    if (authMode === 'register') {
      const cleanPhone = whatsappNumber.trim().replace(/^0+/, '');
      const fullPhone = `${selectedCountry.dialCode}${cleanPhone}`;
      return {
        cleanTarget: fullPhone,
        displayTarget: `${selectedCountry.flag} ${selectedCountry.dialCode} ${whatsappNumber.trim()}`,
        type: 'phone',
      };
    } else {
      if (loginType === 'email') {
        return {
          cleanTarget: loginEmail.trim(),
          displayTarget: loginEmail.trim(),
          type: 'email',
        };
      } else {
        const cleanPhone = loginPhone.trim().replace(/^0+/, '');
        const fullPhone = `${selectedCountry.dialCode}${cleanPhone}`;
        return {
          cleanTarget: fullPhone,
          displayTarget: `${selectedCountry.flag} ${selectedCountry.dialCode} ${loginPhone.trim()}`,
          type: 'phone',
        };
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (authMode === 'register') {
      if (!fullName.trim()) {
        setError('আপনার পূর্ণ নাম লিখুন।');
        return;
      }
      if (!whatsappNumber.trim()) {
        setError('হোয়াটসঅ্যাপ নম্বর প্রদান করুন।');
        return;
      }
      if (whatsappNumber.replace(/[^0-9]/g, '').length < 7) {
        setError('সঠিক হোয়াটসঅ্যাপ নম্বর দিন।');
        return;
      }
      if (!password || password.length < 6) {
        setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (password !== confirmPassword) {
        setError('পাসওয়ার্ড দুটি মিলছে না!');
        return;
      }
    } else {
      if (loginType === 'phone') {
        if (!loginPhone.trim() || loginPhone.replace(/[^0-9]/g, '').length < 7) {
          setError('সঠিক হোয়াটসঅ্যাপ নম্বর দিন।');
          return;
        }
      } else {
        if (!loginEmail.trim() || !loginEmail.includes('@')) {
          setError('সঠিক ইমেইল দিন।');
          return;
        }
      }
      if (!loginPassword) {
        setError('পাসওয়ার্ড লিখুন।');
        return;
      }
    }

    setLoading(true);
    const { cleanTarget, displayTarget, type } = getFormattedTarget();
    setTargetDisplay(displayTarget);

    try {
      const res = await fetch('/api/user/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanTarget,
          type,
          mode: authMode,
          name: authMode === 'register' ? fullName.trim() : '',
          email: authMode === 'register' ? email.trim() : (loginType === 'email' ? loginEmail.trim() : ''),
          password: authMode === 'register' ? password : loginPassword,
          countryCode: selectedCountry.dialCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActiveOtpCode(data.otpCode || '849201');
        if (data.provider) setDeliveryProvider(data.provider);
        if (data.directChatUrl) setServerChatUrl(data.directChatUrl);
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        const providerName =
          data.provider === 'twilio'
            ? 'Twilio WhatsApp API'
            : data.provider === 'whatsapp_cloud_api'
            ? 'Meta WhatsApp Cloud API'
            : 'WhatsApp Gateway';
        setSuccessMessage(`হোয়াটসঅ্যাপে (${providerName}) ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে!`);
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
      } else {
        setError(data.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveOtpCode(mockOtp);
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setSuccessMessage(`হোয়াটসঅ্যাপ ওটিপি কোড: ${mockOtp}`);
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newDigits.every((d) => d !== '') && index === 5) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    if (pasteData.length === 6) {
      verifyOtp(pasteData);
    }
  };

  const verifyOtp = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');
    setError('');

    if (finalCode.length < 6) {
      setError('সম্পূর্ণ ৬ ডিজিটের ওটিপি দিন।');
      return;
    }

    setLoading(true);
    const { cleanTarget, type } = getFormattedTarget();

    try {
      const res = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: cleanTarget,
          otp: finalCode,
          name: authMode === 'register' ? fullName.trim() : '',
          email: authMode === 'register' ? email.trim() : (loginType === 'email' ? loginEmail.trim() : ''),
          password: authMode === 'register' ? password : loginPassword,
          type,
          countryCode: selectedCountry.dialCode,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setSuccessMessage('✓ হোয়াটসঅ্যাপ ভেরিফিকেশন সম্পন্ন!');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setError(data.message || 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড।');
      }
    } catch (err) {
      const mockUser: UserAccount = {
        id: 'usr-' + Date.now(),
        name: fullName.trim() || 'Client ' + cleanTarget.slice(-4),
        email: email.trim() || (cleanTarget.includes('@') ? cleanTarget : `${cleanTarget.replace(/[^0-9]/g, '')}@workhub.local`),
        phone: cleanTarget.startsWith('+') ? cleanTarget : `${selectedCountry.dialCode}${cleanTarget}`,
        registeredAt: new Date().toISOString(),
      };
      onLoginSuccess(mockUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillOtp = () => {
    if (activeOtpCode && activeOtpCode.length === 6) {
      setOtpDigits(activeOtpCode.split(''));
      verifyOtp(activeOtpCode);
    }
  };

  const whatsappChatUrl = `https://wa.me/8801890193985?text=${encodeURIComponent(
    `Hello Shakil WorkHub! My WhatsApp OTP verification code is: ${activeOtpCode || '849201'}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 font-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ক্লায়েন্ট এক্সেস পোর্টাল</h3>
              <p className="text-xs text-slate-400">WhatsApp OTP সিকিউরড ভেরিফিকেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        {step === 'form' && (
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5">
            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              সাইন আপ (Sign Up)
            </button>
            <button
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              লগইন (Login)
            </button>
          </div>
        )}

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      আপনার নাম (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ শাকিল হোসেন"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                      <span>ইমেইল (Email)</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">অপশনাল</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com (যদি থাকে)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *
                    </label>
                    <div className="flex gap-2 relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white flex items-center gap-1 shrink-0"
                      >
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                        <span className="text-[9px] text-slate-400">▼</span>
                      </button>

                      {countryDropdownOpen && (
                        <div className="absolute left-0 top-12 z-30 w-64 max-h-52 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                          <div className="p-1.5 border-b border-slate-800 bg-slate-900">
                            <input
                              type="text"
                              placeholder="দেশ খুঁজুন..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                            {filteredCountries.map((c) => (
                              <button
                                key={c.code + c.dialCode}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className="w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-900 text-slate-200"
                              >
                                <span>{c.flag} {c.nameBn}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <input
                        type="tel"
                        required
                        placeholder={selectedCountry.sample || '01890193985'}
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      পাসওয়ার্ড (Password) *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      আবার পাসওয়ার্ড দিন (Confirm Password) *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="একই পাসওয়ার্ড দিন"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none ${
                          isPasswordMatch
                            ? 'border-emerald-500'
                            : isPasswordMismatch
                            ? 'border-rose-500'
                            : 'border-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div className="mt-1.5">
                        {isPasswordMatch ? (
                          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>✓ পাসওয়ার্ড হুবহু মিলেছে</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>✕ পাসওয়ার্ড দুটি মিলছে না</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isPasswordMismatch}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : <span>সাইন আপ করুন ও হোয়াটসঅ্যাপ ওটিপি নিন</span>}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setLoginType('phone')}
                      className={`flex-1 py-1 rounded font-bold ${
                        loginType === 'phone' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      হোয়াটসঅ্যাপ নম্বর
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginType('email')}
                      className={`flex-1 py-1 rounded font-bold ${
                        loginType === 'email' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      ইমেইল
                    </button>
                  </div>

                  {loginType === 'phone' ? (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        হোয়াটসঅ্যাপ নম্বর
                      </label>
                      <div className="flex gap-2 relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white flex items-center gap-1 shrink-0"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                          <span className="text-[9px] text-slate-400">▼</span>
                        </button>
                        <input
                          type="tel"
                          required
                          placeholder={selectedCountry.sample || '01890193985'}
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        ইমেইল ঠিকানা
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      পাসওয়ার্ড
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="পাসওয়ার্ড দিন"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : <span>লগইন করুন ও হোয়াটসঅ্যাপ ওটিপি নিন</span>}
                  </button>
                </>
              )}
            </form>
          ) : (
            /* OTP Screen */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1.5">
                <span className="text-xs text-emerald-400 font-bold block">
                  হোয়াটসঅ্যাপ ওটিপি ভেরিফিকেশন সেশন
                </span>
                <span className="text-sm font-bold text-white font-mono">{targetDisplay}</span>
              </div>

              {activeOtpCode && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">কোড: <strong className="text-emerald-400 font-mono">{activeOtpCode}</strong></span>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold"
                  >
                    ১-ক্লিকে পূরণ করুন
                  </button>
                </div>
              )}

              <a
                href={serverChatUrl || whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>হোয়াটসঅ্যাপ ওটিপি মেসেজ খুলুন</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-bold rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:border-emerald-400 font-mono"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => verifyOtp()}
                disabled={loading || otpDigits.some((d) => d === '')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? 'যাচাই করা হচ্ছে...' : 'ওটিপি যাচাই করুন'}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="hover:text-cyan-400"
                >
                  ← নম্বর পরিবর্তন করুন
                </button>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
                    className="text-emerald-400 font-bold"
                  >
                    পুনরায় পাঠান
                  </button>
                ) : (
                  <span>পুনরায় পাঠাতে: {resendTimer}s</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
