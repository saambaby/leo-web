/** Nested org summary on `GET /memberships` rows. */
export type OrganizationType = "platform" | "lsp" | "customer";

export interface OrganizationSummary {
  id: string;
  name: string;
  type: OrganizationType;
}

/** Base membership fields shared with `MembershipResponseDto`. */
export interface MembershipResponse {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Active membership row with nested organization metadata. */
export interface MembershipListItem extends MembershipResponse {
  organization: OrganizationSummary;
}
