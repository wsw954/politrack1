//components/provisions/ProvisionDrawer.js
"use client";
import { useEffect, useState } from "react";
import Section from "../annotation/Section";
import GeneralNotesEditor from "../annotation/GeneralNotesEditor";
import LinksList from "../annotation/LinksList";
import AttachmentGallery from "../annotation/AttachmentGallery";
import LabelsChips from "../annotation/LabelsChips";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - provision: { _id, section_number?, heading? , legal_text?, summary? } | null
 * - annotation: { generalNotes, links, attachments, labels } | null
 * - onSave: (payload) => Promise<void>   // payload mirrors PATCH schema
 * - readOnly?: boolean
 */
export default function ProvisionDrawer({
  open,
  onClose,
  provision,
  annotation,
  onSave,
  readOnly = false,
}) {
  const [data, setData] = useState(
    annotation || { generalNotes: "", links: [], attachments: [], labels: [] }
  );
  useEffect(() => {
    setData(
      annotation || { generalNotes: "", links: [], attachments: [], labels: [] }
    );
  }, [annotation]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white p-5 overflow-y-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Provision: {provision?.section_number} — {provision?.heading}
          </h2>
          <button onClick={onClose}>Close</button>
        </div>

        <Section title="General Notes">
          <GeneralNotesEditor
            value={data.generalNotes}
            readOnly={readOnly}
            onChange={(v) => setData((d) => ({ ...d, generalNotes: v }))}
          />
        </Section>

        <Section title="Links">
          <LinksList
            items={data.links}
            readOnly={readOnly}
            onAdd={(l) => setData((d) => ({ ...d, links: [...d.links, l] }))}
            onRemove={(id) =>
              setData((d) => ({
                ...d,
                links: d.links.filter((x) => x._id !== id),
              }))
            }
          />
        </Section>

        <Section title="Attachments">
          <AttachmentGallery
            items={data.attachments}
            readOnly={readOnly}
            onAdd={(a) =>
              setData((d) => ({ ...d, attachments: [...d.attachments, a] }))
            }
            onRemove={(id) =>
              setData((d) => ({
                ...d,
                attachments: d.attachments.filter((x) => x._id !== id),
              }))
            }
          />
        </Section>

        <Section title="Labels">
          <LabelsChips
            items={data.labels}
            readOnly={readOnly}
            onAdd={(lbl) =>
              setData((d) => ({ ...d, labels: [...d.labels, lbl] }))
            }
            onRemove={(id) =>
              setData((d) => ({
                ...d,
                labels: d.labels.filter((x) => x._id !== id),
              }))
            }
            onEditNote={(id, note) =>
              setData((d) => ({
                ...d,
                labels: d.labels.map((x) =>
                  x._id === id ? { ...x, note } : x
                ),
              }))
            }
          />
        </Section>

        {!readOnly && (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-1" onClick={onClose}>
              Cancel
            </button>
            <button
              className="rounded-lg border px-3 py-1"
              onClick={() => onSave(data)}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
