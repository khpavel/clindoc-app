// This mirrors the FastAPI OAuth2PasswordBearer token response
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

