// Shared layout for the privacy policy and terms pages.
export default function LegalPage({ title, updated, children }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-stone-500">Last updated {updated}</p>
      <div className="mt-8 space-y-6 leading-relaxed text-stone-700 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
