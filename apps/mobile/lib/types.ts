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
