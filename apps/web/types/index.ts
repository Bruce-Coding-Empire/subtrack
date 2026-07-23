export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  baseCurrency: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type UserProfile = User & {
  monthlySpendLimit: number | null;
};

export type UpdateUserInput = {
  name?: string;
  baseCurrency?: string;
  monthlySpendLimit?: number | null;
};

export type BillingCycle = "weekly" | "monthly" | "yearly" | "custom";

export type SubscriptionCategory = "entertainment" | "software" | "fitness" | "utilities" | "other";

export type SubscriptionStatus = "active" | "cancelled";

export type Subscription = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  startDate: string;
  nextRenewalDate: string;
};

export type PaymentHistoryEntry = {
  id: string;
  amount: number;
  currency: string;
  paidAt: string;
};

export type SubscriptionDetail = Subscription & {
  paymentHistory: PaymentHistoryEntry[];
};

export type PaginatedSubscriptions = {
  items: Subscription[];
  total: number;
  page: number;
  limit: number;
};

export type CategoryBreakdownEntry = {
  category: SubscriptionCategory;
  amount: number;
  percentage: number;
};

export type UpcomingRenewal = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextRenewalDate: string;
};

export type DashboardSummary = {
  totalMonthlySpend: number;
  totalYearlySpend: number;
  baseCurrency: string;
  activeSubscriptionsCount: number;
  categoryBreakdown: CategoryBreakdownEntry[];
  upcomingRenewals: UpcomingRenewal[];
  spendLimit: number | null;
  currentMonthSpend: number;
  percentageUsed: number | null;
  isOverLimit: boolean;
};

export type SpendTrendPoint = {
  month: string;
  amount: number;
};

export type SpendTrend = {
  baseCurrency: string;
  points: SpendTrendPoint[];
};

export type CreateSubscriptionInput = {
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  category: SubscriptionCategory;
  startDate: string;
};

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;

export type NotificationPreferences = {
  renewalRemindersEnabled: boolean;
  spendLimitAlertsEnabled: boolean;
};

export type UpdateNotificationPreferencesInput = Partial<NotificationPreferences>;
