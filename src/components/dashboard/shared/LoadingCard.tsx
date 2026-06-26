export default function LoadingCard() {
  return (
    <div
      className="
        animate-pulse
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
      "
    >
      <div className="h-6 w-40 bg-zinc-800 rounded mb-6" />

      <div className="space-y-3">
        <div className="h-4 bg-zinc-800 rounded" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-800 rounded w-2/3" />
      </div>
    </div>
  );
}