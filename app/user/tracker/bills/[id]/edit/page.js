//app/user/tracker/bills/[id]edit/page.js

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Spinner from "@/components/ui/Spinner";
import FormInput from "@/components/ui/FormInput";
import FormButton from "@/components/ui/FormButton";

export default function EditTrackedBillPage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // this is [itemId]
  const router = useRouter();

  const [note, setNote] = useState("");
  const [billTitle, setBillTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.user?.id || !id) return;

    const fetchTracked = async () => {
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/bills/${id}`
        );
        const { note, bill } = res.data;
        setNote(note || "");
        setBillTitle(bill?.title || "Tracked Bill");
      } catch (err) {
        console.error("Error fetching tracked bill:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracked();
  }, [session, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id || !id) return;

    setSaving(true);
    try {
      await axios.patch(`/api/users/${session.user.id}/tracker/bills/${id}`, {
        note,
      });
      router.push(`/user/tracker/bills/${id}`);
    } catch (err) {
      console.error("Failed to update tracker note:", err);
      alert("Something went wrong saving your note.");
      setSaving(false);
    }
  };

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-danger">You must be logged in.</p>;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Edit Note: {billTitle}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <FormInput
          label="Your Tracker Note"
          type="textarea"
          rows={6}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why are you tracking this bill?"
        />

        <div className="flex gap-4">
          <FormButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Note"}
          </FormButton>
          <FormButton
            type="button"
            variant="secondary"
            onClick={() => router.push(`/user/tracker/bills/${id}`)}
          >
            Cancel
          </FormButton>
        </div>
      </form>
    </SectionWrapper>
  );
}
