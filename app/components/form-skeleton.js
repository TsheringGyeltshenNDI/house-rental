export default function FormSkeleton() {
  return (
    <div className="space-y-5">
      {[14, 12, 8, 14].map((h, i) => (
        <div key={i} style={{ height: `${h}rem` }} className="animate-pulse rounded-2xl bg-stone-200" />
      ))}
    </div>
  );
}
