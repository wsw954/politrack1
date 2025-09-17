//components/annotation/Section.js
export default function Section({ title, hint, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint ? <p className="text-sm text-gray-500">{hint}</p> : null}
      </div>
      <div className="rounded-2xl border p-4 bg-white">{children}</div>
    </section>
  );
}
