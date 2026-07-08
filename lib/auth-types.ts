export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface MfaEnrollmentRequired {
  mfa_enrollment_required: true;
  enrollment_token: string;
  otpauth_url: string;
  secret: string;
}

export interface MfaRequired {
  mfa_required: true;
}

export type LoginResult = TokenPair | MfaEnrollmentRequired | MfaRequired;

export interface SignupResponse {
  account_type: "personal" | "business";
  organization_id: string | null;
  user_id: string;
  status: string | null;
  email_verification_required: boolean;
}

export function isTokenPair(result: LoginResult): result is TokenPair {
  return "access_token" in result;
}

export function isMfaEnrollmentRequired(
  result: LoginResult,
): result is MfaEnrollmentRequired {
  return "mfa_enrollment_required" in result;
}

export function isMfaRequired(result: LoginResult): result is MfaRequired {
  return "mfa_required" in result;
}

export interface MfaEnrollmentState {
  enrollment_token: string;
  otpauth_url: string;
  secret: string;
}

export interface JwtClaims {
  sub: string;
  tenant_id?: string;
  role: string;
  exp: number;
}

export interface MfaLoginPending {
  email: string;
  password: string;
}

export type SwitchTenantResult =
  | { access_token: string; expires_in: number }
  | { mfa_required: true };

export function isSwitchMfaRequired(
  result: SwitchTenantResult,
): result is { mfa_required: true } {
  return "mfa_required" in result;
}

export type PostLoginNavigation =
  | { kind: "route"; accessToken: string; destination: string }
  | { kind: "mfa"; returnTo: string };

export interface InviteAcceptResponse {
  user_id: string;
  tenant_id: string;
  role: string;
  membership_id: string;
}
