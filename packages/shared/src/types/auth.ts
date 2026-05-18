export type SafeAdmin = {
  id: string;
  email: string;
  lastLoginAt: string | null;
};

export type AuthTokenResponse = {
  admin: SafeAdmin;
  accessToken: string;
};
