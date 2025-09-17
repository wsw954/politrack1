//components/annotation/PageHeader.js
export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex gap-2">{right}</div> : null}
    </div>
  );
}
