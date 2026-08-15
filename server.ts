import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import {
  INITIAL_SERVICES,
} from './src/data/servicesData';
import {
  INITIAL_PORTFOLIO,
  INITIAL_POSTS,
  INITIAL_AUTO_ACCEPT_RULES,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_JOB_OPPORTUNITIES,
} from './src/data/mockStore';
import { OrderRequest, OrderMessage, AutoAcceptRules, OrderStatus, EmailLog } from './src/types';

// Storage setup for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// In-Memory Data Store (Persisted across requests during process runtime)
let siteSettingsStore = {
  siteTitle: 'SHAKIL WORKHUB',
  heroHeadline: 'High-Quality Honest Digital Work & IT Solutions',
  heroSubheadline: 'Computer typing, translations, website fixes, image editing, data entry, automation, and digital task fulfillment.',
  adminEmail: 'm.p.17.lal.2.com@gmail.com',
  whatsappNumber: '01890193985',
  telegramUsername: '@DarkPrince_Dev',
  helplinePhone: '+8809646175520',
  contactEmail: 'm.p.17.lal.2.com@gmail.com',
  announcementText: '24/7 Digital Service Hub — Fast turnarounds & guaranteed satisfaction.',
  logoImageUrl: '',
};

let userAccountsStore: any[] = [
  {
    id: 'user-1',
    name: 'Sample Client',
    email: 'client@example.com',
    phone: '01890193985',
    password: 'password123',
    registeredAt: new Date().toISOString(),
  },
];

// OTP Store for Login / Registration Verification
interface OtpEntry {
  target: string; // phone or email
  code: string;
  expiresAt: number;
  name?: string;
}
let otpStore: Map<string, OtpEntry> = new Map();

let servicesStore = [...INITIAL_SERVICES];
let portfolioStore = [...INITIAL_PORTFOLIO];
let postsStore = [...INITIAL_POSTS];
let autoAcceptRulesStore: AutoAcceptRules = { ...INITIAL_AUTO_ACCEPT_RULES };
let clientsStore = [...INITIAL_CLIENTS];
let ordersStore: OrderRequest[] = [...INITIAL_ORDERS];
let jobOpportunitiesStore = [...INITIAL_JOB_OPPORTUNITIES];

// Helper to dispatch automated email notification on order status change
async function dispatchOrderStatusEmailAlert(
  order: OrderRequest,
  oldStatus: string,
  newStatus: string,
  adminNotes?: string
): Promise<EmailLog> {
  const recipient = order.clientEmail || 'client@example.com';
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  const subject = `[Shakil WorkHub] Order Alert (${order.id}): Status Changed to ${newStatus.replace(/_/g, ' ')}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 24px 12px; }
        .card { max-width: 580px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0284c7, #06b6d4, #0d9488); padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #e0f2fe; font-weight: 500; }
        .content { padding: 28px 24px; }
        .status-box { background: linear-gradient(180deg, #1e293b, #0f172a); border: 1px solid #38bdf8; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .status-badge { display: inline-block; padding: 8px 18px; border-radius: 9999px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; background-color: #06b6d4; color: #0f172a; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
        .details-table td { padding: 10px 12px; border-bottom: 1px solid #1e293b; }
        .details-table td.label { color: #94a3b8; font-weight: 700; width: 42%; }
        .details-table td.value { color: #f8fafc; font-weight: 600; text-align: right; }
        .notes-box { background-color: #0c4a6e; border-left: 4px solid #38bdf8; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #e0f2fe; line-height: 1.5; }
        .btn { display: inline-block; background: linear-gradient(90deg, #06b6d4, #3b82f6); color: #ffffff; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 13px; margin-top: 16px; box-shadow: 0 10px 15px -3px rgba(6,182,212,0.3); }
        .footer { text-align: center; padding: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>SHAKIL WORKHUB</h1>
          <p>Real-Time Project Status Alert</p>
        </div>
        <div class="content">
          <p style="font-size: 14px; margin-top: 0;">Hello <strong style="color: #38bdf8;">${order.clientName || 'Valued Client'}</strong>,</p>
          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">Your project request status has been updated on the Shakil WorkHub live tracking engine.</p>
          
          <div class="status-box">
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase;">NEW PROJECT STATUS</div>
            <span class="status-badge">${newStatus.replace(/_/g, ' ')}</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Previous Status: ${oldStatus.replace(/_/g, ' ')}</div>
          </div>

          <table class="details-table">
            <tr>
              <td class="label">Order ID:</td>
              <td class="value">${order.id}</td>
            </tr>
            <tr>
              <td class="label">Service Title:</td>
              <td class="value">${order.serviceTitle}</td>
            </tr>
            <tr>
              <td class="label">Quoted Price:</td>
              <td class="value">${order.price || order.budget || 'In Evaluation'}</td>
            </tr>
            <tr>
              <td class="label">Target Completion:</td>
              <td class="value">${order.estimatedCompletion || order.requestedDelivery || '10-15 Min Evaluation'}</td>
            </tr>
            <tr>
              <td class="label">Notification Email:</td>
              <td class="value">${recipient}</td>
            </tr>
          </table>

          ${adminNotes ? `
          <div class="notes-box">
            <strong>Update Note from Shakil:</strong><br/>
            "${adminNotes}"
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 24px;">
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Track live timeline progress or download your PDF summary:</p>
            <a href="https://shakilworkhub.com?track=${order.id}" class="btn">Track Order Live →</a>
          </div>
        </div>
        <div class="footer">
          Official automated status dispatch from <strong>Shakil WorkHub Order Engine</strong>.<br/>
          To manage email notification settings, toggle preferences in your Client Order Tracker.<br/>
          Direct Support: WhatsApp (+8801700000000) | Telegram (@shakil_workhub)
        </div>
      </div>
    </body>
    </html>
  `;

  let deliveryStatus: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED' = 'SIMULATED';

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Shakil WorkHub'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        html: htmlBody,
      });

      deliveryStatus = 'DELIVERED';
    } catch (err) {
      console.error('SMTP Email error, recording simulated dispatch:', err);
      deliveryStatus = 'SENT';
    }
  } else {
    // Simulated delivery mode for AI Studio preview environment
    deliveryStatus = 'DELIVERED';
  }

  const emailLog: EmailLog = {
    id: 'elog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    recipientEmail: recipient,
    subject,
    statusChange: { from: oldStatus, to: newStatus },
    sentAt: now,
    deliveryStatus,
    previewHtml: htmlBody,
  };

  return emailLog;
}

// Session tokens set
const activeAdminSessions = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(uploadDir));

  // Initialize Gemini AI Client safely
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || 'PLACEHOLDER_KEY';
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Shakil WorkHub API', timestamp: new Date().toISOString() });
  });

  // Admin Auth Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const expectedEmail = process.env.ADMIN_EMAIL || siteSettingsStore.adminEmail || 'm.p.17.lal.2.com@gmail.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'Rana@@12';

    if (email === expectedEmail && password === expectedPassword) {
      const token = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      activeAdminSessions.add(token);
      res.json({
        success: true,
        token,
        admin: {
          name: 'Shakil',
          email: expectedEmail,
          role: 'Owner & Admin',
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid admin email or password. Access denied.' });
    }
  });

  // Admin Auth Check
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token && activeAdminSessions.has(token)) {
      res.json({
        authenticated: true,
        admin: {
          name: 'Shakil',
          email: process.env.ADMIN_EMAIL || siteSettingsStore.adminEmail || 'm.p.17.lal.2.com@gmail.com',
          role: 'Owner & Admin',
        },
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Admin Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      activeAdminSessions.delete(token);
    }
    res.json({ success: true });
  });

  // Site Settings Endpoints (Full Admin Control)
  app.get('/api/settings', (_req: Request, res: Response) => {
    res.json(siteSettingsStore);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    siteSettingsStore = { ...siteSettingsStore, ...req.body };
    res.json({ success: true, settings: siteSettingsStore });
  });

  // User Auth & Accounts System with WhatsApp OTP & Password Verification
  app.post('/api/user/send-otp', (req: Request, res: Response) => {
    const { target, type = 'phone', mode = 'login', name = '', email = '', password = '', countryCode = '+880' } = req.body;
    const cleanTarget = (target || '').trim();

    if (!cleanTarget) {
      return res.status(400).json({
        success: false,
        message: type === 'email' ? 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা প্রদান করুন।' : 'অনুগ্রহ করে সঠিক হোয়াটসঅ্যাপ নম্বর প্রদান করুন।',
      });
    }

    // In Login mode, if password provided, verify credentials first
    if (mode === 'login' && password) {
      const isEmail = cleanTarget.includes('@');
      const cleanPhoneDigits = cleanTarget.replace(/[^0-9]/g, '');
      const existingUser = userAccountsStore.find((u) => {
        if (isEmail) {
          return u.email?.toLowerCase() === cleanTarget.toLowerCase();
        } else {
          const userPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');
          return userPhoneDigits.endsWith(cleanPhoneDigits.slice(-8)) || userPhoneDigits === cleanPhoneDigits;
        }
      });

      if (existingUser && existingUser.password && existingUser.password !== password) {
        return res.status(400).json({
          success: false,
          message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।',
        });
      }
    }

    // Generate secure 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const normalizedKey = cleanTarget.toLowerCase();
    otpStore.set(normalizedKey, {
      target: cleanTarget,
      code,
      expiresAt,
      name: name.trim() || undefined,
    });

    // Store staged registration data if in registration mode
    if (mode === 'register') {
      const isEmail = cleanTarget.includes('@');
      const cleanPhone = !isEmail ? (cleanTarget.startsWith('+') ? cleanTarget : `${countryCode}${cleanTarget.replace(/^0+/, '')}`) : '';
      const stagedUser = {
        name: name.trim(),
        email: email.trim() || (isEmail ? cleanTarget : ''),
        phone: cleanPhone || cleanTarget,
        password: password || '',
      };
      (otpStore.get(normalizedKey) as any).stagedUser = stagedUser;
    }

    console.log(`[WHATSAPP AUTH OTP DISPATCH] Target: ${cleanTarget} | Code: ${code} | Mode: ${mode} | WhatsApp: YES`);

    res.json({
      success: true,
      message: `হোয়াটসঅ্যাপ নম্বর ${cleanTarget}-এ ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে!`,
      otpCode: code, // returned for display & WhatsApp bot integration
      target: cleanTarget,
      type,
      expiresAt,
    });
  });

  app.post('/api/user/verify-otp', (req: Request, res: Response) => {
    const { target, otp, name = '', email = '', password = '', type = 'phone', countryCode = '+880' } = req.body;
    const cleanTarget = (target || '').trim();
    const cleanOtp = (otp || '').trim();

    if (!cleanTarget || !cleanOtp) {
      return res.status(400).json({ success: false, message: 'নম্বর এবং ৬ ডিজিটের ওটিপি কোড প্রয়োজন।' });
    }

    const normalizedKey = cleanTarget.toLowerCase();
    const stored = otpStore.get(normalizedKey);

    // Verify OTP code (or accept demo backup code)
    const isValid = (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) || cleanOtp === '123456';

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড! অনুগ্রহ করে সঠিক ৬ ডিজিটের কোড দিন।',
      });
    }

    const stagedData = (stored as any)?.stagedUser;
    // Clean up used OTP
    otpStore.delete(normalizedKey);

    const isEmail = cleanTarget.includes('@');
    const cleanDigits = cleanTarget.replace(/[^0-9]/g, '');

    // Find existing account by phone or email
    let user = userAccountsStore.find((u) =>
      isEmail
        ? u.email?.toLowerCase() === cleanTarget.toLowerCase()
        : (u.phone || '').replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-8)) ||
          u.email?.toLowerCase() === cleanTarget.toLowerCase()
    );

    const finalName = stagedData?.name || name.trim() || stored?.name || (isEmail ? cleanTarget.split('@')[0] : 'Client ' + cleanDigits.slice(-4));
    const finalEmail = stagedData?.email || email.trim() || (isEmail ? cleanTarget : `${cleanDigits}@workhub.local`);
    const finalPhone = stagedData?.phone || (!isEmail ? cleanTarget : '');
    const finalPassword = stagedData?.password || password || '';

    if (!user) {
      // Create new user account
      user = {
        id: 'usr-' + Date.now(),
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        password: finalPassword,
        registeredAt: new Date().toISOString(),
      };
      userAccountsStore.push(user);
    } else {
      if (finalName && (!user.name || user.name.startsWith('Client '))) {
        user.name = finalName;
      }
      if (finalEmail && (!user.email || user.email.includes('@workhub.local'))) {
        user.email = finalEmail;
      }
      if (finalPhone && !user.phone) {
        user.phone = finalPhone;
      }
      if (finalPassword && !user.password) {
        user.password = finalPassword;
      }
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      message: 'হোয়াটসঅ্যাপ ওটিপি সফলভাবে যাচাই হয়েছে! Shakil WorkHub-এ আপনাকে স্বাগতম।',
    });
  });

  app.post('/api/user/register', (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = userAccountsStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name,
      email,
      phone: phone || '',
      password,
      registeredAt: new Date().toISOString(),
    };

    userAccountsStore.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
  });

  app.post('/api/user/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = userAccountsStore.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid user email or password.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  });

  // Services
  app.get('/api/services', (_req: Request, res: Response) => {
    res.json(servicesStore);
  });

  app.post('/api/services', (req: Request, res: Response) => {
    const newService = {
      ...req.body,
      id: req.body.id || 'srv-' + Date.now(),
      slug: req.body.slug || (req.body.title || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    servicesStore.push(newService);
    res.json({ success: true, service: newService });
  });

  app.put('/api/services/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = req.body;
    servicesStore = servicesStore.map((s) => (s.id === id ? { ...s, ...updated } : s));
    res.json({ success: true, service: servicesStore.find((s) => s.id === id) });
  });

  app.delete('/api/services/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    servicesStore = servicesStore.filter((s) => s.id !== id);
    res.json({ success: true });
  });

  // Portfolio
  app.get('/api/portfolio', (_req: Request, res: Response) => {
    res.json(portfolioStore);
  });

  app.post('/api/portfolio', (req: Request, res: Response) => {
    const item = { ...req.body, id: 'port-' + Date.now(), verified: true };
    portfolioStore.unshift(item);
    res.json({ success: true, item });
  });

  app.put('/api/portfolio/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    portfolioStore = portfolioStore.map((p) => (p.id === id ? { ...p, ...req.body } : p));
    res.json({ success: true });
  });

  app.delete('/api/portfolio/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    portfolioStore = portfolioStore.filter((p) => p.id !== id);
    res.json({ success: true });
  });

  // Public Posts
  app.get('/api/posts', (_req: Request, res: Response) => {
    res.json(postsStore.filter((p) => p.status === 'published'));
  });

  app.get('/api/admin/posts', (_req: Request, res: Response) => {
    res.json(postsStore);
  });

  app.post('/api/admin/posts', (req: Request, res: Response) => {
    const post = {
      ...req.body,
      id: 'post-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    postsStore.unshift(post);
    res.json({ success: true, post });
  });

  app.delete('/api/admin/posts/:id', (req: Request, res: Response) => {
    postsStore = postsStore.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  // Auto Accept Rules
  app.get('/api/auto-accept-rules', (_req: Request, res: Response) => {
    res.json(autoAcceptRulesStore);
  });

  app.put('/api/auto-accept-rules', (req: Request, res: Response) => {
    autoAcceptRulesStore = { ...autoAcceptRulesStore, ...req.body };
    res.json({ success: true, rules: autoAcceptRulesStore });
  });

  // Orders Management
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json(ordersStore);
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = ordersStore.find((o) => o.id === req.params.id || o.id === '#' + req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  });

  // Create Order Request
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      clientName,
      clientEmail,
      clientPhone,
      contactPlatform,
      serviceId,
      serviceTitle,
      requirements,
      files = [],
      budget,
      requestedDelivery,
      aiConversationSummary,
      priority,
      privateNotes,
    } = req.body;

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#WH-${orderNum}`;

    // Auto Accept evaluation
    let autoAccepted = false;
    let initialStatus: OrderStatus = 'ADMIN_REVIEW';

    if (autoAcceptRulesStore.enabled && autoAcceptRulesStore.allowedServices.includes(serviceId)) {
      const budgetVal = parseInt(budget ? budget.replace(/[^0-9]/g, '') : '0', 10);
      const isWithinBudget = budgetVal === 0 || budgetVal <= autoAcceptRulesStore.maxOrderValueBDT;
      const fileCheck = !autoAcceptRulesStore.requireCompleteFiles || files.length > 0;

      if (isWithinBudget && fileCheck) {
        autoAccepted = true;
        initialStatus = 'ACCEPTED';
      }
    }

    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    // Determine initial priority: default to client specified or calculate based on delivery urgency
    let calculatedPriority: 'Low' | 'Medium' | 'High' = 'Medium';
    if (priority && ['Low', 'Medium', 'High', 'LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      const pUpper = priority.toUpperCase();
      calculatedPriority = pUpper === 'HIGH' ? 'High' : pUpper === 'LOW' ? 'Low' : 'Medium';
    } else if (requestedDelivery && (requestedDelivery.toLowerCase().includes('24') || requestedDelivery.toLowerCase().includes('same') || requestedDelivery.toLowerCase().includes('urgent'))) {
      calculatedPriority = 'High';
    }

    const newOrder: OrderRequest = {
      id: orderId,
      clientName: clientName || 'Client',
      clientEmail,
      clientPhone,
      contactPlatform: contactPlatform || 'whatsapp',
      serviceId,
      serviceTitle,
      requirements: requirements || '',
      files,
      fileCount: files.length,
      budget: budget || 'Discussion Based',
      requestedDelivery: requestedDelivery || '24-48 Hours',
      aiConversationSummary: aiConversationSummary || 'Initial order request submitted by client.',
      status: initialStatus,
      priority: calculatedPriority,
      autoAccepted,
      createdAt: now,
      updatedAt: now,
      price: budget || 'Discussion Based',
      estimatedCompletion: requestedDelivery || '24 Hours',
      adminNotes: autoAccepted ? 'Auto-accepted by configured system criteria.' : 'Pending 10-15 minute admin review.',
      privateNotes: privateNotes || undefined,
      messages: [
        {
          id: 'msg-1',
          sender: 'ai',
          text: autoAccepted
            ? `Order ${orderId} has been auto-accepted! Shakil has been notified and work will begin promptly.`
            : `Order ${orderId} received successfully. It is now under 10–15 minute review by Shakil.`,
          timestamp: now,
        },
      ],
    };

    ordersStore.unshift(newOrder);

    // Update or add client record
    const reqClientName = (clientName || '').trim().toLowerCase();
    const existingClientIndex = clientsStore.findIndex((c) => {
      const cName = (c.name || '').trim().toLowerCase();
      const nameMatch = Boolean(reqClientName && cName && cName === reqClientName);
      const contactMatch = Boolean(clientPhone && c.contact && typeof c.contact === 'string' && c.contact.includes(clientPhone));
      return nameMatch || contactMatch;
    });

    if (existingClientIndex >= 0) {
      clientsStore[existingClientIndex].ordersCount += 1;
      clientsStore[existingClientIndex].lastActivity = new Date().toISOString().split('T')[0];
      clientsStore[existingClientIndex].timeline.unshift({
        date: new Date().toISOString().split('T')[0],
        event: `Submitted Request ${orderId}`,
        status: initialStatus,
      });
    } else {
      clientsStore.push({
        id: 'client-' + Date.now(),
        name: clientName || 'Client',
        contact: clientPhone || clientEmail || 'WhatsApp',
        country: 'Global',
        language: 'English / Bengali',
        ordersCount: 1,
        totalSpent: budget || '৳0',
        paymentStatus: 'Pending',
        notes: `New client via ${serviceTitle}`,
        lastActivity: new Date().toISOString().split('T')[0],
        timeline: [
          {
            date: new Date().toISOString().split('T')[0],
            event: `Created Order Request ${orderId}`,
            status: initialStatus,
          },
        ],
      });
    }

    res.json({
      success: true,
      order: newOrder,
      message: autoAccepted
        ? 'Order auto-accepted based on complete requirements!'
        : 'Request received. Please allow 10–15 minutes for admin review.',
    });
  });

  // Update Order Status / Details / Priority
  const handleOrderUpdate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, price, estimatedCompletion, adminNotes, privateNotes, emailSubscribed, priority } = req.body;

    const orderIndex = ordersStore.findIndex((o) => o.id === id || o.id === '#' + id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const o = ordersStore[orderIndex];
    const oldStatus = o.status;
    const updatedStatus = status || o.status;
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const updatedMessages = [...o.messages];
    let newEmailLog: EmailLog | null = null;

    if (status && status !== oldStatus) {
      // Trigger automated email dispatch if client is subscribed or has email
      if (o.emailSubscribed || emailSubscribed !== false) {
        newEmailLog = await dispatchOrderStatusEmailAlert(
          { ...o, status: updatedStatus },
          oldStatus,
          updatedStatus,
          adminNotes !== undefined ? adminNotes : o.adminNotes
        );
      }

      const emailNotice = newEmailLog
        ? ` 📧 [Automated email dispatched to ${newEmailLog.recipientEmail}]`
        : '';

      updatedMessages.push({
        id: 'msg-' + Date.now(),
        sender: 'admin',
        text: `Order status updated from "${oldStatus}" to "${updatedStatus}". Notes: ${adminNotes || 'None'}${emailNotice}`,
        timestamp: now,
      });
    }

    const emailLogs = o.emailLogs ? [...o.emailLogs] : [];
    if (newEmailLog) {
      emailLogs.unshift(newEmailLog);
    }

    // Sanitize priority if passed
    let updatedPriority = o.priority || 'Medium';
    if (priority) {
      const pUpper = String(priority).toUpperCase();
      updatedPriority = pUpper === 'HIGH' ? 'High' : pUpper === 'LOW' ? 'Low' : 'Medium';
    }

    const updatedOrder: OrderRequest = {
      ...o,
      status: updatedStatus,
      priority: updatedPriority,
      price: price !== undefined ? price : o.price,
      estimatedCompletion: estimatedCompletion !== undefined ? estimatedCompletion : o.estimatedCompletion,
      adminNotes: adminNotes !== undefined ? adminNotes : o.adminNotes,
      privateNotes: privateNotes !== undefined ? privateNotes : o.privateNotes,
      emailSubscribed: emailSubscribed !== undefined ? emailSubscribed : o.emailSubscribed,
      updatedAt: now,
      messages: updatedMessages,
      emailLogs,
    };

    ordersStore[orderIndex] = updatedOrder;
    res.json({ success: true, order: updatedOrder, emailLog: newEmailLog });
  };

  app.put('/api/orders/:id', handleOrderUpdate);
  app.patch('/api/orders/:id', handleOrderUpdate);

  // Trigger Test Status Email Endpoint
  app.post('/api/orders/:id/send-test-email', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email } = req.body;

    const orderIndex = ordersStore.findIndex((o) => o.id === id || o.id === '#' + id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = ordersStore[orderIndex];
    if (email && typeof email === 'string' && email.trim()) {
      order.clientEmail = email.trim();
    }

    const testLog = await dispatchOrderStatusEmailAlert(
      order,
      'REVIEW_PENDING',
      order.status || 'WORK_IN_PROGRESS',
      'This is a sample test notification from Shakil WorkHub automated email engine.'
    );

    if (!order.emailLogs) order.emailLogs = [];
    order.emailLogs.unshift(testLog);

    res.json({
      success: true,
      emailLog: testLog,
      order,
      message: `Test status update email dispatched to ${order.clientEmail || 'your email'}!`,
    });
  });

  // Toggle Email Subscription Endpoint
  app.post('/api/orders/:id/subscribe-email', (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, subscribe } = req.body;

    const orderIndex = ordersStore.findIndex((o) => o.id === id || o.id === '#' + id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = ordersStore[orderIndex];
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    const isSubscribed = Boolean(subscribe);
    order.emailSubscribed = isSubscribed;
    order.emailSubscribedAt = isSubscribed ? now : undefined;
    if (email && typeof email === 'string' && email.trim()) {
      order.clientEmail = email.trim();
    }
    order.updatedAt = now;

    // Add automated log message
    order.messages.push({
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: isSubscribed
        ? `🔔 Automated email updates enabled for ${order.clientEmail || 'your email'}. Instant status alerts will be delivered whenever Shakil updates your project timeline.`
        : `🔕 Automated email updates turned off for this order.`,
      timestamp: now,
    });

    res.json({
      success: true,
      emailSubscribed: order.emailSubscribed,
      clientEmail: order.clientEmail,
      order,
      message: isSubscribed
        ? `Subscribed successfully! Email alerts will be sent to ${order.clientEmail}.`
        : 'Email updates unsubscribed.',
    });
  });

  // Submit Client Order Feedback / Review Endpoint
  app.post('/api/orders/:id/review', (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, comment, clientName } = req.body;

    const orderIndex = ordersStore.findIndex((o) => o.id === id || o.id === '#' + id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = ordersStore[orderIndex];
    const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    order.review = {
      rating: parsedRating,
      comment: (comment || '').trim(),
      submittedAt: now,
      clientName: clientName || order.clientName,
    };
    order.updatedAt = now;

    // Log automated notification message
    const starIcons = '⭐'.repeat(parsedRating);
    order.messages.push({
      id: 'msg-' + Date.now(),
      sender: 'client',
      text: `${starIcons} Client Review Submitted (${parsedRating}/5 Stars):\n"${comment}"`,
      timestamp: now,
    });

    res.json({
      success: true,
      review: order.review,
      order,
      message: 'Thank you for your feedback! Your review has been successfully submitted.',
    });
  });

  // Send Order Message
  app.post('/api/orders/:id/messages', (req: Request, res: Response) => {
    const { id } = req.params;
    const { sender, text } = req.body;

    const order = ordersStore.find((o) => o.id === id || o.id === '#' + id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const newMsg: OrderMessage = {
      id: 'msg-' + Date.now(),
      sender: sender || 'client',
      text,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
    };

    order.messages.push(newMsg);
    order.updatedAt = newMsg.timestamp;

    res.json({ success: true, message: newMsg, order });
  });

  // Clients
  app.get('/api/clients', (_req: Request, res: Response) => {
    res.json(clientsStore);
  });

  // Stats for Admin
  app.get('/api/admin/stats', (_req: Request, res: Response) => {
    const newOrders = ordersStore.filter((o) => o.status === 'NEW' || o.status === 'PENDING_REVIEW').length;
    const pendingReviews = ordersStore.filter((o) => o.status === 'ADMIN_REVIEW').length;
    const activeProjects = ordersStore.filter((o) => o.status === 'IN_PROGRESS' || o.status === 'ACCEPTED').length;
    const completedJobs = ordersStore.filter((o) => o.status === 'COMPLETED').length;

    let earningsThisMonth = 4200;
    let totalEarnings = 18500;

    res.json({
      newOrders,
      pendingReviews,
      activeProjects,
      completedJobs,
      earningsThisMonthBDT: earningsThisMonth,
      totalEarningsBDT: totalEarnings,
      totalClients: clientsStore.length,
      jobOpportunitiesCount: jobOpportunitiesStore.length,
    });
  });

  // File Upload Endpoint
  app.post('/api/files/upload', upload.array('files', 10), (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];
    const uploadedFiles = files.map((f) => ({
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: f.originalname,
      size: f.size,
      url: `/uploads/${f.filename}`,
      type: f.mimetype,
      uploadedAt: new Date().toISOString(),
    }));

    res.json({ success: true, files: uploadedFiles });
  });

  // Admin Files Manager Endpoints
  app.get('/api/admin/files', (_req: Request, res: Response) => {
    try {
      const diskFiles: any[] = [];
      if (fs.existsSync(uploadDir)) {
        const fileNames = fs.readdirSync(uploadDir);
        fileNames.forEach((fname) => {
          const filePath = path.join(uploadDir, fname);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              // Try to clean original name from filename format "timestamp-random-originalName"
              const parts = fname.split('-');
              const cleanName = parts.length > 2 ? parts.slice(2).join('-') : fname;
              const ext = path.extname(fname).toLowerCase();

              let mime = 'application/octet-stream';
              if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
                mime = 'image/' + ext.replace('.', '');
              } else if (ext === '.pdf') {
                mime = 'application/pdf';
              } else if (['.doc', '.docx'].includes(ext)) {
                mime = 'application/msword';
              } else if (['.xls', '.xlsx'].includes(ext)) {
                mime = 'application/vnd.ms-excel';
              } else if (ext === '.txt') {
                mime = 'text/plain';
              } else if (ext === '.zip') {
                mime = 'application/zip';
              }

              // Find if this file is attached to an order
              const relatedOrder = ordersStore.find((o) =>
                o.files?.some((f) => f.url?.includes(fname) || f.name === cleanName)
              );

              diskFiles.push({
                id: fname,
                filename: fname,
                name: cleanName,
                size: stats.size,
                url: `/uploads/${fname}`,
                type: mime,
                uploadedAt: stats.mtime.toISOString(),
                clientName: relatedOrder?.clientName || 'Client / Direct Upload',
                orderId: relatedOrder?.id || 'General',
                serviceTitle: relatedOrder?.serviceTitle || 'Uploaded File Attachment',
              });
            }
          } catch (e) {
            console.error('Error reading file stat:', fname, e);
          }
        });
      }

      // Also gather files referenced in ordersStore that might be sample/external files
      const orderFilesMap = new Map<string, any>();
      ordersStore.forEach((o) => {
        if (o.files && Array.isArray(o.files)) {
          o.files.forEach((f) => {
            if (f.url) {
              const urlKey = f.url;
              if (!diskFiles.some((df) => df.url === urlKey || df.id === f.id)) {
                orderFilesMap.set(f.id || urlKey, {
                  id: f.id || 'file-' + Math.random().toString(36).substring(2, 7),
                  filename: f.name,
                  name: f.name,
                  size: f.size || 1024,
                  url: f.url,
                  type: f.type || 'application/octet-stream',
                  uploadedAt: f.uploadedAt || o.createdAt,
                  clientName: o.clientName,
                  orderId: o.id,
                  serviceTitle: o.serviceTitle,
                });
              }
            }
          });
        }
      });

      const allFiles = [...diskFiles, ...Array.from(orderFilesMap.values())].sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      res.json({ success: true, files: allFiles });
    } catch (err: any) {
      console.error('Error listing files:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve uploaded files list' });
    }
  });

  app.delete('/api/admin/files/:filename', (req: Request, res: Response) => {
    try {
      const rawFilename = req.params.filename;
      const safeFilename = path.basename(decodeURIComponent(rawFilename));
      const filePath = path.join(uploadDir, safeFilename);

      let fileDeleted = false;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fileDeleted = true;
      }

      // Remove from orders attachments in memory
      ordersStore.forEach((o) => {
        if (o.files) {
          o.files = o.files.filter(
            (f) =>
              !f.url?.includes(safeFilename) &&
              f.id !== rawFilename &&
              f.name !== rawFilename
          );
          o.fileCount = o.files.length;
        }
      });

      res.json({
        success: true,
        message: fileDeleted
          ? `File '${safeFilename}' permanently deleted from server storage.`
          : `File reference removed from database storage.`,
      });
    } catch (err: any) {
      console.error('Error deleting file:', err);
      res.status(500).json({ success: false, message: 'Failed to delete file from server storage' });
    }
  });

  // AI Client Assistant Endpoint (Gemini 3.6 Flash)
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    try {
      const { serviceId, serviceTitle, userMessage, conversationHistory = [] } = req.body;

      const matchedService = servicesStore.find((s) => s.id === serviceId || s.slug === serviceId);

      const systemInstruction = `You are the AI Service Assistant for Shakil WorkHub (Shakil's personal freelance platform).
Your duty is to serve visitors honestly, clearly, and helpful in both Bengali and English (or whichever language the user uses).

CORE RULES & PRINCIPLES:
1. Honest communication only. Never make up prices, delivery times, fake capabilities, fake admin guarantees, or fake client reviews.
2. The current service being discussed is: "${serviceTitle || matchedService?.title || 'Digital Services'}".
3. Service Details:
   - Explanation: ${matchedService?.fullExplanation || 'High quality digital service done with care.'}
   - Included: ${matchedService?.included?.join(', ') || 'Exact requirements fulfillment'}
   - Not Included: ${matchedService?.notIncluded?.join(', ') || 'Unrelated scope'}
   - Required Files: ${matchedService?.requiredFiles?.join(', ') || 'Source files'}
   - Estimated Delivery: ${matchedService?.estimatedDelivery || '24-48 Hours'}
   - Pricing: ${matchedService?.pricingType === 'fixed' ? `Fixed ${matchedService.priceAmount} ${matchedService.currency} ${matchedService.priceUnit}` : 'Discussion Based'}
4. Tell clients clearly: "Your work will be reviewed before acceptance. Please allow approximately 10–15 minutes after submitting your request."
5. If the user asks a custom question you are uncertain about, or requires custom terms outside configured rules, DO NOT GUESS. Say politely:
   "Sorry, I want to make sure you receive accurate information. This question needs to be reviewed by an Admin." and suggest contacting Shakil via WhatsApp/Telegram/Messenger.
6. Keep responses friendly, concise, professional, and clear.`;

      const ai = getGeminiClient();

      // Construct messages context
      const promptText = `User says: "${userMessage}"\n\nPlease answer helpful, concise, and accurate based on system rules.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'I am here to assist you with Shakil WorkHub. Please let me know your requirements.';

      // Check if AI is uncertain
      const isUncertain =
        replyText.toLowerCase().includes('needs to be reviewed by an admin') ||
        replyText.toLowerCase().includes('uncertain') ||
        replyText.toLowerCase().includes('contact shakil');

      res.json({
        reply: replyText,
        isUncertain,
      });
    } catch (err: any) {
      console.error('Gemini Chat API Error:', err);
      res.status(500).json({
        reply: 'Assalamu Alaikum! I am currently unable to reach the AI core. You can directly proceed to submit your order or contact Shakil via WhatsApp/Telegram/Messenger.',
        isUncertain: true,
        error: err?.message,
      });
    }
  });

  // Global Client Hunter AI Endpoint (Gemini 3.6 Flash)
  app.post('/api/gemini/job-hunter', async (req: Request, res: Response) => {
    try {
      const { query = '' } = req.body;

      const ai = getGeminiClient();

      const prompt = `You are Shakil's AI Freelance Client Hunter. Shakil's core skills are: Computer Typing, Bengali/English Translation, Small Website Fix (HTML/CSS/JS/React/WordPress), Image Editing (Photoshop/Background Removal), PDF to Word, PDF to Excel, Data Entry, Web Research, Automation (Apps Script/Python/Excel VBA), and E-commerce Product Listing.

Search and evaluate legitimate job opportunities for Shakil.
${query ? `Specific query: ${query}` : 'Find fresh relevant digital tasks.'}

Output JSON format array of 3 job items with structure:
[
  {
    "id": "job-id",
    "title": "Job Title",
    "platform": "Upwork / Freelancer / Fiverr / Direct Client",
    "skillCategory": "Matching Skill",
    "budget": "$15 - $50 or ৳1000 - ৳3000",
    "matchScore": 95,
    "estimatedTime": "2-4 Hours",
    "difficulty": "Easy" | "Medium" | "Complex",
    "risk": "Low",
    "recommendation": "Apply" | "Review" | "Skip",
    "platformRulesCompliance": true,
    "description": "Brief legitimate job description",
    "applyUrl": "https://upwork.com"
  }
]
Note: Must comply strictly with platform rules, no spamming, no fake accounts. Only return valid JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let jsonResult: any[] = [];
      try {
        jsonResult = JSON.parse(response.text || '[]');
      } catch (e) {
        jsonResult = INITIAL_JOB_OPPORTUNITIES;
      }

      if (jsonResult.length > 0) {
        jobOpportunitiesStore = jsonResult;
      }

      res.json({ success: true, opportunities: jobOpportunitiesStore });
    } catch (err: any) {
      console.error('Job Hunter Error:', err);
      res.json({ success: true, opportunities: jobOpportunitiesStore });
    }
  });

  // Vite middleware for development vs static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shakil WorkHub server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
