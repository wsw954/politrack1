//app/bills/layout.js
export default function BillsLayout({ children }) {
  return (
    <section className="py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">Bills</h1>
        <p className="text-base text-neutral-muted">
          Browse, filter, and track legislation.
        </p>
      </header>
      {children}
    </section>
  );
}
