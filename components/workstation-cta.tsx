"use client";

import { useSyncExternalStore } from "react";

type PlatformHint = "mac" | "windows" | "other";

function detectPlatform(): PlatformHint {
  const ua = navigator.userAgent;
  if (/Mac|iPhone|iPad/i.test(ua)) return "mac";
  if (/Win/i.test(ua)) return "windows";
  return "other";
}

function subscribeToPlatform() {
  return () => {};
}

function installHint(platform: PlatformHint): string {
  switch (platform) {
    case "mac":
      return "Install Leo Workstation from your organization's macOS download, then return here to open it.";
    case "windows":
      return "Install Leo Workstation from your organization's Windows download, then return here to open it.";
    default:
      return "Install Leo Workstation on your device, then return here to open it.";
  }
}

export function WorkstationCta() {
  const platform = useSyncExternalStore(
    subscribeToPlatform,
    detectPlatform,
    () => "other" as PlatformHint,
  );

  return (
    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Leo Workstation</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Calls and dispatch run in the Leo Workstation desktop app. Open the app
        when you are ready — this page will not launch it automatically.
      </p>
      <a
        href="leoconnexio://"
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-500 sm:w-auto"
      >
        Open Leo Workstation
      </a>
      <p className="mt-4 text-xs text-zinc-500">{installHint(platform)}</p>
    </div>
  );
}
