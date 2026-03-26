import { useState } from "react";
import { Download } from "lucide-react";

const STYLES = ["short", "detailed", "formal", "casual", "funny", "storytelling"];

const styleColors = {
  short: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  detailed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  formal: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  casual: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  funny: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  storytelling: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function CaptionPanel({ captions }) {
  const [active, setActive] = useState("short");

  const downloadTxt = () => {
    const text = STYLES.map((s) => `[${s.toUpperCase()}]\n${captions[s]}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "captions.txt";
    a.click();
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(captions, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "captions.json";
    a.click();
  };

  return (
    <div className="card animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Captions</h2>
        <div className="flex gap-2">
          <button onClick={downloadTxt} className="btn-secondary flex items-center gap-1 text-xs">
            <Download size={13} /> TXT
          </button>
          <button onClick={downloadJson} className="btn-secondary flex items-center gap-1 text-xs">
            <Download size={13} /> JSON
          </button>
        </div>
      </div>

      {/* Style tabs */}
      <div className="flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`badge cursor-pointer capitalize transition-all ${
              active === s ? styleColors[s] + " ring-2 ring-offset-1 ring-violet-400" : styleColors[s]
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Active caption */}
      <p className="text-gray-700 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm">
        {captions[active]}
      </p>

      {/* Top 3 */}
      {captions.top3?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Top 3 Beam Outputs
          </p>
          <ol className="space-y-2">
            {captions.top3.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-bold text-violet-500">#{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
