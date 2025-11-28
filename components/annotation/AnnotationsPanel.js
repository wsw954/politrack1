//components/annotation/AnnotationsPanel.js
"use client";

/**
 * AnnotationsPanel (composed)
 * - Reuses your existing building blocks:
 *   - GeneralNotesEditor (notes)
 *   - LinksList (links add/remove)
 *   - LabelsChips (labels add/remove/edit note)
 * - Keeps your annotations shape the same on save:
 *   {
 *     generalNotes: string,
 *     links:       [{ url, title?, note? }],
 *     attachments: [{ url, alt?, note? }],
 *     labels:      [{ label, note? }]
 *   }
 */

import { useMemo, useState } from "react";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LabelsChips from "@/components/annotation/LabelsChips";
import LinksList from "@/components/annotation/LinksList";

export default function AnnotationsPanel({ scope, provId, value, onChange }) {
  const [attachDraft, setAttachDraft] = useState("");

  const counts = useMemo(
    () => ({
      links: Array.isArray(value.links) ? value.links.length : 0,
      labels: Array.isArray(value.labels) ? value.labels.length : 0,
      attachments: Array.isArray(value.attachments)
        ? value.attachments.length
        : 0,
    }),
    [value]
  );

  const header =
    scope === "provision" ? (
      <>
        Editing provision{" "}
        <code className="px-1 py-0.5 rounded bg-gray-100">
          {String(provId)}
        </code>
      </>
    ) : (
      <>Editing whole-bill annotations</>
    );

  // ---------- helpers ----------
  const update = (patch) => onChange({ ...value, ...patch });

  // synthesize a stable local _id so LinksList/LabelsChips show the remove buttons
  const withLocalIds = (arr, kind) =>
    (Array.isArray(arr) ? arr : []).map((item, idx) => ({
      _id:
        item._id ||
        `${kind}:${idx}:${kind === "link" ? item.url || "" : item.label || ""}`,
      ...item,
    }));

  // URL validator (lightweight; server re-validates too)
  const isValidUrl = (u) => {
    try {
      const x = new URL(String(u));
      return !!x.protocol && !!x.host;
    } catch {
      return false;
    }
  };

  // ---------- render ----------
  return (
    <div className="space-y-8">
      {/* Context */}
      <div className="text-xs text-gray-500">{header}</div>

      {/* General Notes (reuse) */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">General Notes</h3>
        </div>
        <GeneralNotesEditor
          value={value.generalNotes || ""}
          onChange={(text) => update({ generalNotes: text })}
          maxLength={20000}
          autoSave={true}
        />
      </section>

      {/* Links (reuse) */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Links</h3>
          <span className="text-xs text-gray-500">{counts.links}</span>
        </div>

        <div className="mt-2">
          <LinksList
            items={withLocalIds(value.links, "link")}
            onAdd={(link) => {
              if (!link?.url || !isValidUrl(link.url)) return;
              const next = Array.isArray(value.links) ? [...value.links] : [];
              next.push({
                url: String(link.url).trim(),
                title: link.title ? String(link.title).trim() : "",
                note: link.note ? String(link.note).trim() : "",
              });
              update({ links: next });
            }}
            onRemove={(index) => {
              const next = Array.isArray(value.links) ? [...value.links] : [];
              if (index < 0 || index >= next.length) return;
              next.splice(index, 1);
              update({ links: next });
            }}
            readOnly={false}
          />
        </div>
      </section>

      {/* Attachments (simple inline UI; you don't have an Attachments component) */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Attachments (images)</h3>
          <span className="text-xs text-gray-500">{counts.attachments}</span>
        </div>

        {/* Quick add */}
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Paste image URL to add"
            value={attachDraft}
            onChange={(e) => setAttachDraft(e.target.value)}
          />
          <button
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              if (!isValidUrl(attachDraft)) return;
              const next = Array.isArray(value.attachments)
                ? [...value.attachments]
                : [];
              next.push({ url: attachDraft.trim(), alt: "", note: "" });
              update({ attachments: next });
              setAttachDraft("");
            }}
            disabled={!isValidUrl(attachDraft)}
            title={!isValidUrl(attachDraft) && attachDraft ? "Invalid URL" : ""}
          >
            Add
          </button>
        </div>

        {/* List */}
        <div className="mt-3 space-y-3">
          {(value.attachments || []).map((a, idx) => {
            const bad = a?.url && !isValidUrl(a.url);
            return (
              <div
                key={`${a.url}-${idx}`}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    className={`flex-1 rounded-md border px-2 py-2 text-sm ${
                      bad ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="https://…/image.jpg"
                    value={a?.url || ""}
                    onChange={(e) => {
                      const next = [...(value.attachments || [])];
                      next[idx] = { ...(next[idx] || {}), url: e.target.value };
                      update({ attachments: next });
                    }}
                  />
                  <button
                    className="rounded-md border px-2 py-2 text-xs hover:bg-gray-50"
                    onClick={() => {
                      const next = [...(value.attachments || [])];
                      next.splice(idx, 1);
                      update({ attachments: next });
                    }}
                    aria-label="Remove attachment"
                  >
                    Remove
                  </button>
                </div>

                {!bad &&
                  a?.url &&
                  /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(a.url) && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.url}
                        alt={a.alt || "attachment preview"}
                        className="max-h-40 rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className="rounded-md border border-gray-300 px-2 py-2 text-sm"
                    placeholder="Alt text (optional)"
                    value={a?.alt || ""}
                    onChange={(e) => {
                      const next = [...(value.attachments || [])];
                      next[idx] = {
                        ...(next[idx] || {}),
                        alt: e.target.value.slice(0, 200),
                      };
                      update({ attachments: next });
                    }}
                  />
                  <input
                    className="rounded-md border border-gray-300 px-2 py-2 text-sm"
                    placeholder="Note (optional)"
                    value={a?.note || ""}
                    onChange={(e) => {
                      const next = [...(value.attachments || [])];
                      next[idx] = {
                        ...(next[idx] || {}),
                        note: e.target.value.slice(0, 500),
                      };
                      update({ attachments: next });
                    }}
                  />
                </div>
              </div>
            );
          })}
          {(!value.attachments || value.attachments.length === 0) && (
            <p className="text-xs text-gray-500">No attachments yet.</p>
          )}
        </div>
      </section>

      {/* Labels (reuse) */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Labels</h3>
          <span className="text-xs text-gray-500">{counts.labels}</span>
        </div>

        <div className="mt-2">
          <LabelsChips
            items={withLocalIds(value.labels, "label")}
            onAdd={({ label, note }) => {
              const v = (label || "").trim();
              if (!v) return;
              const next = Array.isArray(value.labels) ? [...value.labels] : [];
              next.push({ label: v, note: note ? String(note).trim() : "" });
              update({ labels: next });
            }}
            onEditNote={(id, note) => {
              const next = Array.isArray(value.labels) ? [...value.labels] : [];
              const idx = next.findIndex(
                (lb, i) => `label:${i}:${lb.label || ""}` === id
              );
              if (idx >= 0) {
                next[idx] = {
                  ...(next[idx] || {}),
                  note: String(note || "").slice(0, 500),
                };
                update({ labels: next });
              }
            }}
            onRemove={(id) => {
              const next = Array.isArray(value.labels) ? [...value.labels] : [];
              const idx = next.findIndex(
                (lb, i) => `label:${i}:${lb.label || ""}` === id
              );
              if (idx >= 0) {
                next.splice(idx, 1);
                update({ labels: next });
              } else {
                // fallback remove by raw label match
                update({ labels: next.filter((lb) => lb.label !== id) });
              }
            }}
            readOnly={false}
          />
        </div>
      </section>
    </div>
  );
}
