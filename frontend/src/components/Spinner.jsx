export default function Spinner({ label = "Processing…" }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{label}</p>
    </div>
  );
}
