/** Privileged roles that require MFA before protected access (INV-AUTH-3). */
export const PRIVILEGED_ROLES = [
  "platform_admin",
  "lsp_admin",
  "sub_admin",
] as const;

export type PrivilegedRole = (typeof PRIVILEGED_ROLES)[number];

export function isPrivilegedRole(role: string): role is PrivilegedRole {
  return (PRIVILEGED_ROLES as readonly string[]).includes(role);
}
