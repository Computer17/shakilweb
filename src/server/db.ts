import fs from 'fs';
import path from 'path';
import {
  INITIAL_SERVICES,
} from '../data/servicesData';
import {
  INITIAL_PORTFOLIO,
  INITIAL_POSTS,
  INITIAL_AUTO_ACCEPT_RULES,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_JOB_OPPORTUNITIES,
} from '../data/mockStore';

export interface DatabaseSchema {
  siteSettings: {
    siteTitle: string;
    heroHeadline: string;
    heroSubheadline: string;
    adminEmail: string;
    whatsappNumber: string;
    telegramUsername: string;
    helplinePhone: string;
    contactEmail: string;
    announcementText: string;
    logoImageUrl: string;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    registeredAt: string;
  }>;
  otps: Array<{
    target: string;
    code: string;
    expiresAt: number;
    name?: string;
    stagedUser?: any;
    deliveryMethod?: string;
  }>;
  orders: any[];
  orderMessages: any[];
  portfolio: any[];
  services: any[];
  posts: any[];
  clients: any[];
  autoAcceptRules: any;
  jobOpportunities: any[];
  emailLogs: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA: DatabaseSchema = {
  siteSettings: {
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
  },
  users: [
    {
      id: 'usr-1001',
      name: 'মোঃ শাকিল হোসেন (Admin)',
      email: 'm.p.17.lal.2.com@gmail.com',
      phone: '+8801890193985',
      password: 'password123',
      registeredAt: new Date().toISOString(),
    },
    {
      id: 'usr-1002',
      name: 'Sample Client',
      email: 'client@example.com',
      phone: '+8801711223344',
      password: 'password123',
      registeredAt: new Date().toISOString(),
    },
  ],
  otps: [],
  orders: INITIAL_ORDERS,
  orderMessages: [],
  portfolio: INITIAL_PORTFOLIO,
  services: INITIAL_SERVICES,
  posts: INITIAL_POSTS,
  clients: INITIAL_CLIENTS,
  autoAcceptRules: INITIAL_AUTO_ACCEPT_RULES,
  jobOpportunities: INITIAL_JOB_OPPORTUNITIES,
  emailLogs: [],
};

// In-Memory Cache with Disk Persistence
let memoryDb: DatabaseSchema = { ...INITIAL_DATA };

// Ensure data folder and file exist
export function initDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      if (fileData.trim()) {
        const parsed = JSON.parse(fileData);
        memoryDb = {
          ...INITIAL_DATA,
          ...parsed,
          siteSettings: { ...INITIAL_DATA.siteSettings, ...(parsed.siteSettings || {}) },
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : INITIAL_DATA.users,
          orders: Array.isArray(parsed.orders) && parsed.orders.length > 0 ? parsed.orders : INITIAL_DATA.orders,
        };
        return memoryDb;
      }
    }

    // Write initial database file
    saveDatabase();
  } catch (err) {
    console.error('[DB INIT ERROR]', err);
  }
  return memoryDb;
}

// Save database to disk safely
export function saveDatabase(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Clean expired OTPs before saving
    const now = Date.now();
    memoryDb.otps = memoryDb.otps.filter((o) => o.expiresAt > now);

    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    // In serverless read-only environments (e.g. Vercel tmp fallback), log warning
    console.warn('[DB SAVE NOTE] Persisted in memory (Disk write note:', err instanceof Error ? err.message : err, ')');
  }
}

// Getter and Setter helpers
export const db = {
  get: () => memoryDb,
  set: (newDb: Partial<DatabaseSchema>) => {
    memoryDb = { ...memoryDb, ...newDb };
    saveDatabase();
  },
  getUsers: () => memoryDb.users,
  addUser: (user: any) => {
    memoryDb.users.push(user);
    saveDatabase();
    return user;
  },
  findUserByPhoneOrEmail: (target: string) => {
    const cleanDigits = target.replace(/[^0-9]/g, '');
    const isEmail = target.includes('@');
    return memoryDb.users.find((u) => {
      if (isEmail) {
        return u.email?.toLowerCase() === target.toLowerCase();
      }
      const uDigits = (u.phone || '').replace(/[^0-9]/g, '');
      return uDigits.endsWith(cleanDigits.slice(-8)) || uDigits === cleanDigits;
    });
  },
  saveOtp: (otp: { target: string; code: string; expiresAt: number; name?: string; stagedUser?: any; deliveryMethod?: string }) => {
    const index = memoryDb.otps.findIndex((o) => o.target.toLowerCase() === otp.target.toLowerCase());
    if (index >= 0) {
      memoryDb.otps[index] = otp;
    } else {
      memoryDb.otps.push(otp);
    }
    saveDatabase();
  },
  getOtp: (target: string) => {
    return memoryDb.otps.find((o) => o.target.toLowerCase() === target.toLowerCase());
  },
  deleteOtp: (target: string) => {
    memoryDb.otps = memoryDb.otps.filter((o) => o.target.toLowerCase() !== target.toLowerCase());
    saveDatabase();
  },
};

// Auto-initialize on import
initDatabase();
