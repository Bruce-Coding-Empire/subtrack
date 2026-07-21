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
