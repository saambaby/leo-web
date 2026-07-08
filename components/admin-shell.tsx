"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { PermissionGate } from "@/components/permission-gate";
import { SwitchTenantModal } from "@/components/switch-tenant-modal";
import { useMemberships } from "@/lib/hooks/use-memberships";
import type { Permission } from "@/lib/permissions/has-permission";

interface NavItem {
  label: string;
  href: string;
  permission: Permission;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function navSectionsForRole(role: string): NavSection[] {
  const account: NavSection = {
    title: "Account",
    items: [{ label: "Profile", href: "/account", permission: "memberships:read" }],
  };

  switch (role) {
    case "platform_admin":
      return [
        {
          title: "Platform",
          items: [
            {
              label: "Dashboard",
              href: "/admin/platform",
              permission: "catalog:languages:write",
            },
          ],
        },
        account,
      ];
    case "lsp_admin":
    case "sub_admin":
      return [
        {
          title: "LSP",
          items: [
            {
              label: "Dashboard",
              href: "/admin/lsp",
              permission: "affiliations:tenant:patch",
            },
          ],
        },
        account,
      ];
    case "customer_admin":
      return [
        {
          title: "Portal",
          items: [
            {
              label: "Organization",
              href: "/portal/org",
              permission: "orgs:write",
            },
            {
              label: "Call",
              href: "/portal/call",
              permission: "orgs:read",
            },
          ],
        },
        account,
      ];
    case "customer_user":
      return [
        {
          title: "Portal",
          items: [
            {
              label: "Call",
              href: "/portal/call",
              permission: "orgs:read",
            },
          ],
        },
        account,
      ];
    default:
      return [account];
  }
}

function NavLink({ href, label, permission }: NavItem) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/account" && pathname.startsWith(`${href}/`));

  return (
    <PermissionGate permission={permission} fallback={null}>
      <Link
        href={href}
        className={`block rounded-md px-3 py-2 font-sans text-sm transition ${
          active
            ? "bg-canvas font-medium text-foreground"
            : "text-secondary hover:bg-canvas/60 hover:text-foreground"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    </PermissionGate>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { clearSession, decodeClaims } = useAuth();
  const { data: memberships } = useMemberships();

  const claims = decodeClaims();
  const role = claims?.role ?? "interpreter";

  const orgName = useMemo(() => {
    if (!claims?.tenant_id) {
      return "No organization";
    }

    const active = memberships?.find(
      (membership) => membership.tenant_id === claims.tenant_id,
    );

    return active?.organization.name ?? "Organization";
  }, [claims, memberships]);

  const navSections = useMemo(() => navSectionsForRole(role), [role]);

  const handleSignOut = useCallback(async () => {
    await clearSession();
    router.replace("/login");
  }, [clearSession, router]);

  return (
    <div className="flex min-h-full flex-col bg-canvas text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Leo Connexio
          </p>
          <p className="truncate font-display text-sm font-semibold">{orgName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Suspense fallback={null}>
            <SwitchTenantModal />
          </Suspense>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-md border border-border bg-surface px-3 py-1.5 font-display text-sm font-medium text-secondary transition hover:bg-canvas hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-surface p-4 md:block">
          <nav className="space-y-6" aria-label="Main">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        href={item.href}
                        label={item.label}
                        permission={item.permission}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
