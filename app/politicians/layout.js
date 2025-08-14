// app/politicians/layout.js
export default function PoliticiansLayout({ children }) {
  return (
    <section className="py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">Politicians</h1>
        <p className="text-base text-neutral-muted">
          See profiles, committees, and voting records.
        </p>
      </header>
      {children}
    </section>
  );
}
