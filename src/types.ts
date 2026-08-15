export type PricingType = 'fixed' | 'discussion';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortIntro: string;
  fullExplanation: string;
  included: string[];
  notIncluded: string[];
  requiredFiles: string[];
  requiredInfo: string[];
  estimatedDelivery: string;
  pricingType: PricingType;
  priceAmount?: number;
  priceUnit?: string;
  currency?: string;
  examples: { title: string; description: string; tag: string }[];
  faqs: { question: string; answer: string }[];
  iconName: string;
  category: string;
}

export type OrderStatus =
  | 'NEW'
  | 'PENDING_REVIEW'
  | 'AI_REVIEW'
  | 'ADMIN_REVIEW'
  | 'DISCUSSION'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CLIENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderMessage {
  id: string;
  sender: 'client' | 'admin' | 'ai';
  text: string;
  timestamp: string;
  attachments?: { name: string; url: string }[];
}

export interface OrderFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface OrderReview {
  rating: number;
  comment: string;
  submittedAt: string;
  clientName?: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  statusChange: {
    from: string;
    to: string;
  };
  sentAt: string;
  deliveryStatus: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  previewHtml?: string;
}

export type OrderPriority = 'Low' | 'Medium' | 'High' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface OrderRequest {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  contactPlatform?: 'whatsapp' | 'telegram' | 'messenger' | 'email';
  serviceId: string;
  serviceTitle: string;
  requirements: string;
  files: OrderFile[];
  fileCount: number;
  budget?: string;
  requestedDelivery?: string;
  aiConversationSummary?: string;
  status: OrderStatus;
  priority?: OrderPriority;
  autoAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  price?: string;
  estimatedCompletion?: string;
  adminNotes?: string;
  privateNotes?: string;
  emailSubscribed?: boolean;
  emailSubscribedAt?: string;
  emailLogs?: EmailLog[];
  review?: OrderReview;
  messages: OrderMessage[];
}

export interface AutoAcceptRules {
  enabled: boolean;
  allowedServices: string[];
  maxOrderValueBDT: number;
  maxDeliveryHours: number;
  requireCompleteFiles: boolean;
  workingHoursOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  customRules: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category:
    | 'Websites'
    | 'Automation'
    | 'Data Work'
    | 'PDF/Word/Excel'
    | 'Image Work'
    | 'Product Listing'
    | 'Research'
    | 'Other Digital Work';
  previewUrl?: string;
  tools: string[];
  date: string;
  result: string;
  testimonial?: {
    client: string;
    text: string;
    role?: string;
  };
  verified: boolean;
}

export interface ClientRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contact?: string;
  country?: string;
  language?: string;
  ordersCount: number;
  totalSpentBDT?: number;
  totalSpent?: string;
  paymentStatus: string;
  notes?: string;
  firstSeen?: string;
  lastActivity?: string;
}

export interface ClientItem extends ClientRecord {
  timeline?: { date: string; event: string; status: string }[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  platform: string;
  skillCategory: string;
  budget: string;
  matchScore: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Complex';
  risk: 'Low' | 'Medium' | 'High';
  recommendation: 'Apply' | 'Review' | 'Skip';
  platformRulesCompliance: boolean;
  description: string;
  applyUrl?: string;
}

export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  imageUrl?: string;
  date: string;
  status: 'published' | 'draft';
}

export interface AdminStats {
  newOrders: number;
  pendingReviews: number;
  activeProjects: number;
  completedJobs: number;
  earningsThisMonthBDT: number;
  totalEarningsBDT: number;
  totalClients: number;
  jobOpportunitiesCount: number;
}

export interface SiteSettings {
  siteTitle: string;
  heroHeadline: string;
  heroSubheadline: string;
  adminEmail: string;
  whatsappNumber: string;
  telegramUsername: string;
  helplinePhone: string;
  contactEmail: string;
  announcementText: string;
  logoImageUrl?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  registeredAt: string;
}

export interface ClientNotification {
  id: string;
  orderId: string;
  type: 'ACCEPTED' | 'REJECTED' | 'PRICE_PROPOSAL' | 'IN_PROGRESS' | 'COMPLETED' | 'ADMIN_REVIEW' | 'MESSAGE' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  data?: {
    status?: OrderStatus;
    price?: string;
    estimatedCompletion?: string;
    adminNotes?: string;
  };
}

