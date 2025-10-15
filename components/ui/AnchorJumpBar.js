//components/ui/AnchorJumpBar.js

export default function AnchorJumpBar({
  items = [], // [{ id: "links", label: "Links" }]
  className = "",
  sticky = true,
}) {
  return (
    <nav
      className={[
        sticky ? "sticky top-16 z-10" : "",
        "bg-white/80 backdrop-blur border rounded-xl px-2 py-2",
        className,
      ].join(" ")}
    >
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
