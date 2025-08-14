//app/tags/layout.js
export default function TagsLayout({ children }) {
  return (
    <section className="py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">Tags</h1>
        <p className="text-base text-neutral-muted">
          Explore issues and group bills by topic.
        </p>
      </header>
      {children}
    </section>
  );
}
