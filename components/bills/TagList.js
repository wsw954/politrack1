// /components/bills/TagList.js
export default function TagList({ tags = [] }) {
  if (!tags.length)
    return <p className="text-neutral-muted">No tags provided.</p>;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-block bg-primary-light text-primary-dark text-xs font-semibold px-3 py-1 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
