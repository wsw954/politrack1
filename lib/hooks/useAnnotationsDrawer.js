// lib/hooks/useAnnotationsDrawer.js
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function useAnnotationsDrawer() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const isOpen = params.get("panel") === "annotations";
  const scope = params.get("scope") || "bill";
  const provId = params.get("provId") || null;

  const openBill = () => {
    const p = new URLSearchParams(params.toString());
    p.set("panel", "annotations");
    p.set("scope", "bill");
    p.delete("provId");
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const openProvision = (pid) => {
    const p = new URLSearchParams(params.toString());
    p.set("panel", "annotations");
    p.set("scope", "provision");
    p.set("provId", String(pid));
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const close = () => {
    const p = new URLSearchParams(params.toString());
    p.delete("panel");
    p.delete("scope");
    p.delete("provId");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return { isOpen, scope, provId, openBill, openProvision, close };
}
