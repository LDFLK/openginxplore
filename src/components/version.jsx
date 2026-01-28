export default function Version() {
  const version = window?.configs?.version || "";

  if (!version) return null;

  return (
    <sup className="text-[0.4em] ml-1 px-1 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent font-semibold align-super">
      {version}
    </sup>
  );
}
