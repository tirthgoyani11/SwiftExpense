// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  userId: string;
  user?: User;
  receipts: Receipt[];
  approvals: Approval[];
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  expenseId: string;
  ocrData?: OCRData;
  createdAt: string;
}

export interface OCRData {
  amount?: number;
  currency?: string;
  date?: string;
  merchant?: string;
  category?: string;
  confidence: number;
  rawText: string;
}

// Approval Types
export interface Approval {
  id: string;
  expenseId: string;
  expense?: Expense;
  approverId: string;
  approver?: User;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalAction {
  expenseId: string;
  action: 'APPROVE' | 'REJECT';
  comments?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Analytics Types
export interface DashboardMetrics {
  totalExpenses: number;
  monthlyExpenses: number;
  pendingApprovals: number;
  recentActivities: Activity[];
  expensesByCategory: CategoryData[];
  monthlyTrends: TrendData[];
}

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
  color: string;
}

export interface TrendData {
  month: string;
  amount: number;
  count: number;
}

export interface Activity {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Form Types
export interface ExpenseFormData {
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  receipts?: File[];
}

export interface ExpenseFilters {
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Socket Events
export interface SocketEvents {
  'expense:created': Expense;
  'expense:updated': Expense;
  'expense:approved': Approval;
  'expense:rejected': Approval;
  'notification:new': Notification;
  'user:online': { userId: string; status: boolean };
}

// Theme Types
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  gray: Record<string, string>;
}