// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  companyId: string
  managerId?: string
  isActive: boolean
  avatarUrl?: string
  preferences: Record<string, any>
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

// Company Types
export interface Company {
  id: string
  name: string
  currencyCode: string
  country: string
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Expense Types
export interface Expense {
  id: string
  employeeId: string
  employee?: User
  amount: number
  originalCurrency: string
  convertedAmount: number
  exchangeRate?: number
  category: ExpenseCategory
  subcategory?: string
  description: string
  expenseDate: string
  receiptUrl?: string
  receiptData?: OCRData
  status: ExpenseStatus
  location?: Location
  tags?: string[]
  approvalSteps?: ApprovalStep[]
  createdAt: string
  updatedAt: string
}

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  OFFICE = 'OFFICE',
  EQUIPMENT = 'EQUIPMENT',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER'
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// OCR Types
export interface OCRData {
  amount?: number
  currency?: string
  merchant?: string
  date?: string
  items?: LineItem[]
  confidence: number
  rawText: string
}

export interface LineItem {
  description: string
  amount: number
  quantity?: number
}

// Approval Types
export interface ApprovalStep {
  id: string
  expenseId: string
  approverId: string
  approver?: User
  stepOrder: number
  status: ApprovalStatus
  comments?: string
  approvedAt?: string
  createdAt: string
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ApprovalWorkflow {
  id: string
  companyId: string
  name: string
  description?: string
  rules: WorkflowRule[]
  conditions?: WorkflowCondition[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WorkflowRule {
  type: 'AMOUNT_THRESHOLD' | 'PERCENTAGE_APPROVAL' | 'SPECIFIC_APPROVER' | 'TIME_BASED'
  value: any
  approvers?: string[]
}

export interface WorkflowCondition {
  field: string
  operator: string
  value: any
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

export enum NotificationType {
  EXPENSE_SUBMITTED = 'EXPENSE_SUBMITTED',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  EXPENSE_APPROVED = 'EXPENSE_APPROVED',
  EXPENSE_REJECTED = 'EXPENSE_REJECTED'
}

// Analytics Types
export interface AnalyticsData {
  spendingTrends: SpendingTrend[]
  categoryBreakdown: CategoryBreakdown[]
  approvalMetrics: ApprovalMetrics
  anomalyDetection: Anomaly[]
  predictions: PredictionData
}

export interface SpendingTrend {
  period: string
  amount: number
  currency: string
}

export interface CategoryBreakdown {
  category: ExpenseCategory
  amount: number
  percentage: number
  count: number
}

export interface ApprovalMetrics {
  averageApprovalTime: number
  approvalRate: number
  pendingCount: number
  totalProcessed: number
}

export interface Anomaly {
  id: string
  type: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  expenseId?: string
}

export interface PredictionData {
  nextMonthSpending: number
  categoryPredictions: CategoryPrediction[]
  budgetRecommendations: BudgetRecommendation[]
}

export interface CategoryPrediction {
  category: ExpenseCategory
  predictedAmount: number
  confidence: number
}

export interface BudgetRecommendation {
  category: ExpenseCategory
  recommendedBudget: number
  reason: string
}

// Location Types
export interface Location {
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface ExpenseFormData {
  amount: number
  currency: string
  category: ExpenseCategory
  subcategory?: string
  description: string
  expenseDate: string
  receiptFile?: File
  tags?: string[]
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName?: string
}

// Store Types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (credentials: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => void
  initializeAuth: () => void
}

export interface ExpenseState {
  expenses: Expense[]
  currentExpense: Expense | null
  loading: boolean
  error: string | null
  fetchExpenses: () => Promise<void>
  createExpense: (data: ExpenseFormData) => Promise<void>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

// Socket.io Types
export interface SocketEvents {
  expense_submitted: (expense: Expense) => void
  expense_approved: (expense: Expense) => void
  expense_rejected: (expense: Expense) => void
  notification: (notification: Notification) => void
}