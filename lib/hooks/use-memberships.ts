"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import type { MembershipListItem } from "@/lib/membership-types";

export const membershipsQueryKey = ["memberships"] as const;

async function fetchMemberships(): Promise<MembershipListItem[]> {
  return api<MembershipListItem[]>("/memberships");
}

export function useMemberships() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: membershipsQueryKey,
    queryFn: fetchMemberships,
    enabled: Boolean(accessToken),
  });
}
