//components/annotation/AnnotationsDrawer.js
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import useAnnotationsDrawer from "@/lib/hooks/useAnnotationsDrawer";
import {
  getBillAnnotations,
  putBillAnnotations,
  deleteBillAnnotations,
  getProvisionAnnotations,
  putProvisionAnnotations,
  deleteProvisionAnnotations,
} from "@/lib/api/annotations";
import { useRouter } from "next/navigation";
import AnnotationsPanel from "./AnnotationsPanel";

export default function AnnotationsDrawer({ userId, billId, onSaved }) {
  const { isOpen, scope, provId, close } = useAnnotationsDrawer();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState({
    generalNotes: "",
    links: [],
    attachments: [],
    labels: [],
  });
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  // Title
  const title =
    scope === "provision" ? "Annotations — Provision" : "Annotations — Bill";

  // Body scroll lock while open
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isOpen) {
      root.style.overflow = "hidden";
    } else {
      root.style.overflow = "";
    }
    return () => {
      root.style.overflow = "";
    };
  }, [isOpen, mounted]);

  // Load current annotations when open/scope changes
  useEffect(() => {
    if (!isOpen || !userId || !billId) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (scope === "provision" && provId) {
          const data = await getProvisionAnnotations(userId, billId, provId);
          if (!cancelled)
            setValue(
              data ?? {
                generalNotes: "",
                links: [],
                attachments: [],
                labels: [],
              }
            );
        } else {
          const data = await getBillAnnotations(userId, billId);
          if (!cancelled)
            setValue(
              data ?? {
                generalNotes: "",
                links: [],
                attachments: [],
                labels: [],
              }
            );
        }
      } catch (e) {
        console.error("Failed to load annotations:", e);
        if (!cancelled)
          setValue({
            generalNotes: "",
            links: [],
            attachments: [],
            labels: [],
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, scope, provId, userId, billId]);

  // Save handler (PUT)
  const handleSave = useCallback(
    async (nextValue) => {
      if (!userId || !billId) return;
      setSaving(true);
      try {
        if (scope === "provision" && provId) {
          await putProvisionAnnotations(userId, billId, provId, nextValue);
        } else {
          await putBillAnnotations(userId, billId, nextValue);
        }

        setValue(nextValue);
        onSaved?.();
        close();
        router.refresh();
      } catch (e) {
        console.error("Save annotations error:", e);
      } finally {
        setSaving(false);
      }
    },
    [userId, billId, scope, provId, close, onSaved, router]
  );

  // Clear handler (DELETE)
  const handleClear = useCallback(async () => {
    if (!userId || !billId) return;
    setSaving(true);
    try {
      if (scope === "provision" && provId) {
        await deleteProvisionAnnotations(userId, billId, provId);
      } else {
        await deleteBillAnnotations(userId, billId);
      }
      setValue({ generalNotes: "", links: [], attachments: [], labels: [] });
      onSaved?.();
      router.refresh();
      // optionally close() as well if you want Clear to exit the drawer
    } catch (e) {
      console.error("Clear annotations error:", e);
    } finally {
      setSaving(false);
    }
  }, [userId, billId, scope, provId, onSaved, router]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Overlay click to close
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      close();
    }
  };

  // Focus first interactive element when opening
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const first = panelRef.current.querySelector(
          "textarea, input, button, select, [tabindex]:not([tabindex='-1'])"
        );
        if (first && typeof first.focus === "function") first.focus();
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  const body = (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px]"
      aria-hidden="true"
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="annotations-drawer-title"
        className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-200
                   flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b">
          <h2 id="annotations-drawer-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={close}
            className="rounded-md px-3 py-2 text-sm border hover:bg-gray-50"
            aria-label="Close annotations drawer"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-sm text-gray-500">Loading annotations…</div>
          ) : (
            <AnnotationsPanel
              scope={scope} // "bill" | "provision"
              provId={provId || null}
              value={value} // { generalNotes, links, attachments, labels }
              onChange={setValue} // pass state setter so panel can be controlled
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t bg-white">
          <button
            onClick={handleClear}
            disabled={saving}
            className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="text-sm px-3 py-2 rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(value)}
              disabled={saving}
              className="text-sm px-3 py-2 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );

  // Use a portal so the drawer is outside layout stacking contexts
  return createPortal(body, document.body);
}
