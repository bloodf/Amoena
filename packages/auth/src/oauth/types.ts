export type OAuthProvider = 'github' | 'google' | 'microsoft' | 'gitlab' | string;

export type OAuthConfig = {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
};

export type OAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: number;
  scope?: string;
};
