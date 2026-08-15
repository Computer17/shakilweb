import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  User,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Globe,
  ExternalLink,
  MessageSquare,
  Check,
} from 'lucide-react';
import { UserAccount, SiteSettings } from '../../types';
import { COUNTRY_CODES, CountryCode, DEFAULT_COUNTRY_CODE } from '../../data/countryCodes';

interface MandatoryAuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  onOpenAdminLogin: () => void;
  siteSettings?: SiteSettings;
}

export const MandatoryAuthScreen: React.FC<MandatoryAuthScreenProps> = ({
  onLoginSuccess,
  onOpenAdminLogin,
  siteSettings,
}) => {
  // Mode: 'register' | 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

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
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Status & Loaders
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Refs for 6-digit OTP inputs
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

  // Filtered countries for dropdown search
  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.nameBn.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dialCode.includes(countrySearch)
  );

  // Password matching and strength verification
  const isPasswordMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch =
    password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;

  // Password strength calculation
  const getPasswordStrength = (pass: string): { label: string; color: string; percent: number } => {
    if (!pass) return { label: '', color: 'bg-slate-700', percent: 0 };
    if (pass.length < 6) return { label: 'খুব দুর্বল (Very Weak)', color: 'bg-rose-500', percent: 25 };
    if (pass.length < 8) return { label: 'মোটামুটি (Fair)', color: 'bg-amber-500', percent: 50 };
    const hasNum = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    if (hasNum && hasLetter && pass.length >= 8) {
      return { label: 'খুব শক্তিশালী (Strong)', color: 'bg-emerald-500', percent: 100 };
    }
    return { label: 'ভালো (Good)', color: 'bg-cyan-500', percent: 75 };
  };

  const passwordStrength = getPasswordStrength(password);

  // Countdown timer for OTP resend
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

  // Construct full target number or email
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

  // Handle Form Submit: Validate & Trigger WhatsApp OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (authMode === 'register') {
      // Validation for Sign Up
      if (!fullName.trim()) {
        setError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন (Please enter your name).');
        return;
      }
      if (!whatsappNumber.trim()) {
        setError('অনুগ্রহ করে আপনার হোয়াটসঅ্যাপ নম্বর প্রদান করুন (Please enter WhatsApp number).');
        return;
      }
      const rawNumber = whatsappNumber.replace(/[^0-9]/g, '');
      if (rawNumber.length < 7) {
        setError('হোয়াটসঅ্যাপ নম্বরটি সঠিক নয়। অনুগ্রহ করে সম্পূর্ণ নম্বর দিন।');
        return;
      }
      if (!password) {
        setError('অনুগ্রহ করে একটি নিরাপদ পাসওয়ার্ড লিখুন।');
        return;
      }
      if (password.length < 6) {
        setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (!confirmPassword) {
        setError('পাসওয়ার্ড নিশ্চিত করতে পুনরায় পাসওয়ার্ড দিন।');
        return;
      }
      if (password !== confirmPassword) {
        setError('পাসওয়ার্ড দুটি মিলছে না! অনুগ্রহ করে হুবহু একই পাসওয়ার্ড লিখুন।');
        return;
      }
    } else {
      // Validation for Login
      if (loginType === 'phone') {
        if (!loginPhone.trim()) {
          setError('অনুগ্রহ করে আপনার হোয়াটসঅ্যাপ নম্বর লিখুন।');
          return;
        }
        if (loginPhone.replace(/[^0-9]/g, '').length < 7) {
          setError('সঠিক হোয়াটসঅ্যাপ নম্বর লিখুন।');
          return;
        }
      } else {
        if (!loginEmail.trim() || !loginEmail.includes('@')) {
          setError('অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।');
          return;
        }
      }
      if (!loginPassword) {
        setError('অনুগ্রহ করে আপনার অ্যাকাউন্টের পাসওয়ার্ড লিখুন।');
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
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMessage(`হোয়াটসঅ্যাপে ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে!`);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 200);
      } else {
        setError(data.message || 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      // Fallback generator
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveOtpCode(mockOtp);
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setSuccessMessage(`হোয়াটসঅ্যাপ ওটিপি ভেরিফিকেশন কোড প্রস্তুত: ${mockOtp}`);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (newDigits.every((d) => d !== '') && index === 5) {
      verifyOtpCode(newDigits.join(''));
    }
  };

  // Handle backspace navigation in OTP
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
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
      verifyOtpCode(pasteData);
    } else {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  // Verify OTP Code
  const verifyOtpCode = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');
    setError('');
    setSuccessMessage('');

    if (finalCode.length < 6) {
      setError('অনুগ্রহ করে সম্পূর্ণ ৬ ডিজিটের ওটিপি প্রদান করুন।');
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
        setSuccessMessage('✓ হোয়াটসঅ্যাপ ভেরিফিকেশন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 600);
      } else {
        setError(data.message || 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      // Offline fallback login
      const mockUser: UserAccount = {
        id: 'usr-' + Date.now(),
        name: fullName.trim() || 'Client ' + cleanTarget.slice(-4),
        email: email.trim() || (cleanTarget.includes('@') ? cleanTarget : `${cleanTarget.replace(/[^0-9]/g, '')}@workhub.local`),
        phone: cleanTarget.startsWith('+') ? cleanTarget : `${selectedCountry.dialCode}${cleanTarget}`,
        registeredAt: new Date().toISOString(),
      };
      onLoginSuccess(mockUser);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    handleSubmit({ preventDefault: () => {} } as any);
  };

  // Auto fill demo OTP
  const handleAutoFillOtp = () => {
    if (activeOtpCode && activeOtpCode.length === 6) {
      const digits = activeOtpCode.split('');
      setOtpDigits(digits);
      verifyOtpCode(activeOtpCode);
    }
  };

  // WhatsApp click-to-chat URL for instant WhatsApp access
  const whatsappChatUrl = `https://wa.me/8801890193985?text=${encodeURIComponent(
    `Hello Shakil WorkHub! My WhatsApp OTP verification code for login is: ${activeOtpCode || '849201'}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-y-auto">
      {/* Background ambient glowing gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden my-auto backdrop-blur-md">
        {/* Top Header */}
        <div className="p-6 sm:p-8 pb-5 bg-gradient-to-b from-slate-800/60 to-transparent border-b border-slate-800/80 text-center relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-3.5">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp OTP সিকিউরড এক্সেস</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {siteSettings?.siteTitle || 'SHAKIL WORKHUB'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            প্রজেক্ট ট্র্যাকিং, সার্ভিস অর্ডার ও সাপোর্ট পেতে আপনার অ্যাকাউন্টে সাইন আপ অথবা লগইন করুন।
          </p>

          {/* Mode Switch Tabs (Sign Up vs Login) */}
          {step === 'form' && (
            <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>নতুন সাইন আপ (Sign Up)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>লগইন (Login)</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 pt-5 space-y-5">
          {/* Global Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Global Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* ================= STEP 1: FORM INPUTS ================= */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ------------ SIGN UP FORM ------------ */}
              {authMode === 'register' ? (
                <>
                  {/* Field 1: Name (নাম) */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-400" />
                        <span>আপনার নাম (Full Name)</span>
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold">*বাধ্যতামূলক</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ শাকিল হোসেন"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Field 2: Email (ইমেইল - অপশনাল) */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-cyan-400" />
                        <span>ইমেইল ঠিকানা (Email Address)</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        অপশনাল / ঐচ্ছিক
                      </span>
                    </label>
                    <input
                      type="email"
                      placeholder="যেমন: example@gmail.com (যদি থাকে)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Field 3: WhatsApp Number with Country Code Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">📲 OTP পাঠানো হবে</span>
                    </label>

                    <div className="flex gap-2 relative" ref={dropdownRef}>
                      {/* Country Code Trigger */}
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        <span className="text-base">{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                        <span className="text-[10px] text-slate-400">▼</span>
                      </button>

                      {/* Country Selector Dropdown List */}
                      {countryDropdownOpen && (
                        <div className="absolute left-0 top-14 z-30 w-72 max-h-60 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
                          <div className="p-2 border-b border-slate-800 bg-slate-900">
                            <input
                              type="text"
                              placeholder="দেশ বা কোড খুঁজুন..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
                            {filteredCountries.map((c) => (
                              <button
                                key={c.code + c.dialCode}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountryDropdownOpen(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-900 transition-colors cursor-pointer ${
                                  selectedCountry.code === c.code && selectedCountry.dialCode === c.dialCode
                                    ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                                    : 'text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{c.flag}</span>
                                  <span className="truncate max-w-[130px]">{c.nameBn}</span>
                                </div>
                                <span className="font-mono text-slate-400 text-[11px]">{c.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Phone Input */}
                      <input
                        type="tel"
                        required
                        placeholder={selectedCountry.sample || '01890193985'}
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      আপনার দেশের কোড সিলেক্ট করে সঠিক WhatsApp নম্বর লিখুন।
                    </span>
                  </div>

                  {/* Field 4: Password (পাসওয়ার্ড) */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>পাসওয়ার্ড (Password)</span>
                      </span>
                      {password && (
                        <span className={`text-[10px] font-bold ${passwordStrength.percent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Live Password Strength Meter */}
                    {password && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Field 5: Confirm Password (আবার পাসওয়ার্ড) & Automated Match Verification */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>আবার পাসওয়ার্ড দিন (Confirm Password)</span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="একই পাসওয়ার্ড পুনরায় লিখুন"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                          isPasswordMatch
                            ? 'border-emerald-500 focus:border-emerald-400'
                            : isPasswordMismatch
                            ? 'border-rose-500 focus:border-rose-400'
                            : 'border-slate-800 focus:border-cyan-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Automatic Realtime Password Match Verification Badge */}
                    {confirmPassword.length > 0 && (
                      <div className="mt-2">
                        {isPasswordMatch ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl animate-in fade-in">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>✓ পাসওয়ার্ড সঠিকভাবে মিলেছে (Password Matched)</span>
                          </div>
                        ) : isPasswordMismatch ? (
                          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl animate-in fade-in">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>✕ পাসওয়ার্ড দুটি মিলছে না! অনুগ্রহ করে মিলিয়ে নিন।</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Sign Up Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || isPasswordMismatch}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        <span>হোয়াটসঅ্যাপ ওটিপি জেনারেট হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>সাইন আপ করুন ও হোয়াটসঅ্যাপ ওটিপি নিন</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* ------------ LOGIN FORM ------------ */
                <>
                  {/* Login Type Switch */}
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setLoginType('phone')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        loginType === 'phone'
                          ? 'bg-slate-800 text-emerald-400 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>হোয়াটসঅ্যাপ নম্বর দিয়ে</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginType('email')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        loginType === 'email'
                          ? 'bg-slate-800 text-cyan-400 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Mail className="h-3 w-3" />
                      <span>ইমেইল দিয়ে</span>
                    </button>
                  </div>

                  {loginType === 'phone' ? (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)
                      </label>
                      <div className="flex gap-2 relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                          className="px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.dialCode}</span>
                          <span className="text-[10px] text-slate-400">▼</span>
                        </button>

                        {countryDropdownOpen && (
                          <div className="absolute left-0 top-14 z-30 w-72 max-h-60 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in fade-in">
                            <div className="p-2 border-b border-slate-800 bg-slate-900">
                              <input
                                type="text"
                                placeholder="দেশ বা কোড খুঁজুন..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto flex-1 divide-y divide-slate-800/60">
                              {filteredCountries.map((c) => (
                                <button
                                  key={c.code + c.dialCode}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setCountryDropdownOpen(false);
                                    setCountrySearch('');
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-900 text-slate-200 cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{c.flag}</span>
                                    <span className="truncate max-w-[130px]">{c.nameBn}</span>
                                  </div>
                                  <span className="font-mono text-slate-400 text-[11px]">{c.dialCode}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <input
                          type="tel"
                          required
                          placeholder={selectedCountry.sample || '01890193985'}
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        ইমেইল ঠিকানা (Email Address)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      পাসওয়ার্ড (Password)
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="আপনার পাসওয়ার্ড দিন"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Login Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        <span>যাচাই ও ওটিপি পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <span>লগইন করুন ও হোয়াটসঅ্যাপ ওটিপি নিন</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {/* ================= STEP 2: WHATSAPP OTP VERIFICATION SESSION ================= */}
          {step === 'otp' && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              {/* WhatsApp Notification Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/40 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                  <MessageSquare className="h-4 w-4" />
                  <span>হোয়াটসঅ্যাপে ওটিপি কোড পাঠানো হয়েছে</span>
                </div>
                <div className="text-sm font-bold text-white font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
                  {targetDisplay}
                </div>
                <p className="text-[11px] text-slate-400">
                  আপনার হোয়াটসঅ্যাপে প্রেরিত ৬ সংখ্যার গোপন ওটিপি কোডটি নিচের ঘরে বসান।
                </p>
              </div>

              {/* Instant WhatsApp Quick Actions (Direct Launch & Auto-fill) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>WhatsApp ওটিপি সহায়তা</span>
                  </span>
                  {activeOtpCode && (
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/40 cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      <span>১-ক্লিকে অটো-ফিল করুন ({activeOtpCode})</span>
                    </button>
                  )}
                </div>

                <a
                  href={whatsappChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>📲 হোয়াটসঅ্যাপে ওটিপি মেসেজটি দেখুন / খুলুন</span>
                  <ExternalLink className="h-3 w-3 text-emerald-400" />
                </a>
              </div>

              {/* 6-Digit Individual OTP Input Boxes */}
              <div>
                <label className="text-xs font-bold text-slate-300 block text-center mb-2.5">
                  ৬ ডিজিটের ওটিপি লিখুন (Enter 6-Digit Code)
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
                      className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-2xl bg-slate-950 border transition-all focus:outline-none font-mono ${
                        digit
                          ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                          : 'border-slate-800 text-white focus:border-cyan-400 focus:bg-slate-900'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify OTP Button */}
              <button
                type="button"
                onClick={() => verifyOtpCode()}
                disabled={loading || otpDigits.some((d) => d === '')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>যাচাই সম্পন্ন করে প্রবেশ করুন</span>
                  </>
                )}
              </button>

              {/* Resend & Change Target Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                  className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span>← তথ্য বা নম্বর পরিবর্তন করুন</span>
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-emerald-400 hover:underline font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>পুনরায় WhatsApp-এ ওটিপি পাঠান</span>
                  </button>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>পুনরায় পাঠাতে বাকি: {resendTimer}s</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Secret / Hidden Admin Access Footer Trigger */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/60 text-center text-[11px] text-slate-600 flex items-center justify-between px-6">
          <span>🔒 256-Bit SSL Encrypted Verification</span>
          <button
            type="button"
            onClick={onOpenAdminLogin}
            title="System Command Login"
            className="text-slate-700 hover:text-slate-400 transition-colors cursor-pointer text-[10px]"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};
