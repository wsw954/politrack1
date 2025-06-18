//app/user/tracker/tags/[id]/edit/page.js

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Spinner from "@/components/ui/Spinner";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";

export default function EditTrackedTagNotePage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // This is tagId
  const router = useRouter();

  const [note, setNote] = useState("");
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTag = async () => {
      if (!session?.user?.id || !id) return;

      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/tags/${id}`
        );
        const trackedTag = res.data;
        setNote(trackedTag.note || "");
        setTagName(trackedTag.tagId?.name || "Tag");
      } catch (err) {
        console.error("Failed to load tag note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [session, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      await axios.patch(`/api/users/${session.user.id}/tracker/tags/${id}`, {
        note,
      });
      router.push(`/user/tracker/tags/${id}`);
    } catch (err) {
      alert("Failed to update note.");
      console.error(err);
      setSaving(false);
    }
  };

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Edit Note: {tagName}</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <FormInput
          label="Your Note"
          type="textarea"
          rows={6}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why are you tracking this tag?"
        />

        <div className="flex gap-4">
          <FormButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Note"}
          </FormButton>
          <FormButton
            type="button"
            variant="secondary"
            onClick={() => router.push(`/user/tracker/tags/${id}`)}
          >
            Cancel
          </FormButton>
        </div>
      </form>
    </SectionWrapper>
  );
}
