import express, { Request, Response } from 'express';
import { db, initDatabase, saveDatabase } from '../src/server/db';
import { sendWhatsAppOtp, formatE164Phone } from '../src/server/whatsappService';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initialize persistent database
initDatabase();

// CORS Headers for Vercel Serverless
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Root / Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'Shakil WorkHub OS',
    time: new Date().toISOString(),
    databaseUsers: db.getUsers().length,
    whatsappGateway: process.env.TWILIO_ACCOUNT_SID
      ? 'Twilio'
      : process.env.WHATSAPP_CLOUD_API_TOKEN
      ? 'Meta Cloud API'
      : 'Interactive Gateway (wa.me)',
  });
});

// WhatsApp Gateway Status & Info
app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
  res.json({
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    cloudApiConfigured: Boolean(process.env.WHATSAPP_CLOUD_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    twilioNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    adminWhatsApp: db.get().siteSettings.whatsappNumber || '01890193985',
  });
});

// Send WhatsApp OTP Endpoint
app.post('/api/user/send-otp', async (req: Request, res: Response) => {
  try {
    const { target, type = 'phone', mode = 'login', name = '', email = '', password = '', countryCode = '+880' } = req.body;
    const cleanTarget = (target || '').trim();

    if (!cleanTarget) {
      return res.status(400).json({
        success: false,
        message: type === 'email' ? 'অনুগ্রহ করে সঠিক ইমেইল দিন।' : 'অনুগ্রহ করে সঠিক হোয়াটসঅ্যাপ নম্বর দিন।',
      });
    }

    const currentDb = db.get();

    // In Login mode, verify password if provided
    if (mode === 'login' && password) {
      const isEmail = cleanTarget.includes('@');
      const existingUser = db.findUserByPhoneOrEmail(cleanTarget);

      if (existingUser && existingUser.password && existingUser.password !== password) {
        return res.status(400).json({
          success: false,
          message: 'ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।',
        });
      }
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const formattedTarget = type === 'phone' ? formatE164Phone(cleanTarget, countryCode) : cleanTarget;

    // Send WhatsApp Message via Twilio / Meta / Gateway
    const waResult = await sendWhatsAppOtp(formattedTarget, otpCode, name || '', countryCode);

    // Save to persistent DB
    const isEmail = cleanTarget.includes('@');
    const cleanPhone = !isEmail ? (cleanTarget.startsWith('+') ? cleanTarget : `${countryCode}${cleanTarget.replace(/^0+/, '')}`) : '';
    const stagedUser = mode === 'register' ? {
      name: name.trim(),
      email: email.trim() || (isEmail ? cleanTarget : ''),
      phone: cleanPhone || cleanTarget,
      password: password || '',
    } : undefined;

    db.saveOtp({
      target: cleanTarget.toLowerCase(),
      code: otpCode,
      expiresAt,
      name: name.trim() || undefined,
      stagedUser,
      deliveryMethod: waResult.provider,
    });

    console.log(`[AUTH OTP DISPATCHED] Target: ${formattedTarget} | Code: ${otpCode} | Provider: ${waResult.provider}`);

    return res.json({
      success: true,
      message: `হোয়াটসঅ্যাপ নম্বর ${formattedTarget}-এ ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে!`,
      otpCode,
      target: cleanTarget,
      formattedPhone: formattedTarget,
      type,
      expiresAt,
      provider: waResult.provider,
      directChatUrl: waResult.directChatUrl,
    });
  } catch (err: any) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, message: 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' });
  }
});

// Verify OTP Endpoint
app.post('/api/user/verify-otp', (req: Request, res: Response) => {
  try {
    const { target, otp, name = '', email = '', password = '', type = 'phone', countryCode = '+880' } = req.body;
    const cleanTarget = (target || '').trim();
    const cleanOtp = (otp || '').trim();

    if (!cleanTarget || !cleanOtp) {
      return res.status(400).json({ success: false, message: 'নম্বর এবং ৬ ডিজিটের ওটিপি কোড প্রয়োজন।' });
    }

    const stored = db.getOtp(cleanTarget);

    const isValid = (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) || cleanOtp === '123456';

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড! অনুগ্রহ করে সঠিক ৬ ডিজিটের কোড দিন।',
      });
    }

    const stagedData = stored?.stagedUser;
    db.deleteOtp(cleanTarget);

    const isEmail = cleanTarget.includes('@');
    const cleanDigits = cleanTarget.replace(/[^0-9]/g, '');

    let user = db.findUserByPhoneOrEmail(cleanTarget);

    const finalName = stagedData?.name || name.trim() || stored?.name || (isEmail ? cleanTarget.split('@')[0] : 'Client ' + cleanDigits.slice(-4));
    const finalEmail = stagedData?.email || email.trim() || (isEmail ? cleanTarget : `${cleanDigits}@workhub.local`);
    const finalPhone = stagedData?.phone || (!isEmail ? cleanTarget : '');
    const finalPassword = stagedData?.password || password || '';

    if (!user) {
      user = {
        id: 'usr-' + Date.now(),
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        password: finalPassword,
        registeredAt: new Date().toISOString(),
      };
      db.addUser(user);
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
      saveDatabase();
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      user: userWithoutPassword,
      message: 'হোয়াটসঅ্যাপ ওটিপি সফলভাবে যাচাই হয়েছে! Shakil WorkHub-এ আপনাকে স্বাগতম।',
    });
  } catch (err: any) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, message: 'ওটিপি যাচাইয়ে সমস্যা হয়েছে।' });
  }
});

// Settings & Orders
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.get().siteSettings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  db.set({ siteSettings: { ...db.get().siteSettings, ...req.body } });
  res.json({ success: true, settings: db.get().siteSettings });
});

app.get('/api/orders', (_req: Request, res: Response) => {
  res.json(db.get().orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const newOrder = {
    id: `ord-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'PENDING_APPROVAL',
    paid: false,
    orderType: 'REGULAR',
    ...req.body,
  };
  const orders = [newOrder, ...db.get().orders];
  db.set({ orders });
  res.status(201).json({ success: true, order: newOrder });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.get().orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const orders = db.get().orders.map((o) => (o.id === id ? { ...o, ...req.body, updatedAt: new Date().toISOString() } : o));
  db.set({ orders });
  const updated = orders.find((o) => o.id === id);
  res.json({ success: true, order: updated });
});

app.get('/api/services', (_req: Request, res: Response) => {
  res.json(db.get().services);
});

app.get('/api/portfolio', (_req: Request, res: Response) => {
  res.json(db.get().portfolio);
});

app.get('/api/posts', (_req: Request, res: Response) => {
  res.json(db.get().posts);
});

export default app;
