//utils/fetchTrackedIds.js
export async function fetchTrackedIds(itemType) {
  try {
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (!session?.user?.id) return new Set();

    const res = await fetch(
      `/api/users/${session.user.id}/tracker/${itemType}`
    );
    if (!res.ok) return new Set();

    const data = await res.json();

    return new Set(
      data
        .map((item) =>
          typeof item.itemId === "string" ? item.itemId : item.itemId?._id
        )
        .filter(Boolean)
    );
  } catch (err) {
    console.error(`Error fetching tracked ${itemType}:`, err);
    return new Set();
  }
}
