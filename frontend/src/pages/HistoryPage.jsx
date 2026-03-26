import { useState, useEffect } from "react";
import { getImageUrl } from "../services/api";
import { Clock, ImageOff, Trash2 } from "lucide-react";

const HISTORY_KEY = "visionai_history";

const ACTION_COLORS = {
  caption: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  detect: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  vqa: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function HistoryPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    setRecords(saved);
  }, []);

  const clearHistory = () => {
    sessionStorage.removeItem(HISTORY_KEY);
    setRecords([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={22} className="text-violet-500" />
          <h1 className="text-2xl font-bold">Analysis History</h1>
        </div>
        {records.length > 0 && (
          <button onClick={clearHistory} className="btn-secondary flex items-center gap-1 text-xs text-red-500">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {records.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-16 text-gray-400">
          <ImageOff size={40} />
          <p>No history yet. Analyze an image first!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((r, i) => (
          <div key={i} className="card animate-fade-in flex gap-4">
            <img
              src={getImageUrl(r.file_id)}
              alt="thumb"
              className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100 dark:bg-gray-800"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`badge capitalize ${ACTION_COLORS[r.action] || "bg-gray-100 text-gray-600"}`}>
                  {r.action}
                </span>
                <span className="text-xs text-gray-400 truncate">{r.file_id}</span>
              </div>
              <p className="text-xs text-gray-400">{r.created_at?.slice(0, 19).replace("T", " ")} UTC</p>
              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {r.action === "caption" && r.result?.short}
                {r.action === "detect" && `${Array.isArray(r.result) ? r.result.length : 0} objects detected`}
                {r.action === "vqa" && (
                  <span>
                    <span className="font-medium">Q:</span> {r.result?.question}
                    {" → "}
                    <span className="font-medium">A:</span> {r.result?.answer}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
