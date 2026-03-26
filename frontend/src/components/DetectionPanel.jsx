import { useEffect, useRef, useState } from "react";
import { getImageUrl } from "../services/api";

const COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#14b8a6",
];

export default function DetectionPanel({ detections, fileId }) {
  const canvasRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!showOverlay || !detections.length) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getImageUrl(fileId);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      detections.forEach(({ label, confidence, box }, i) => {
        const color = COLORS[i % COLORS.length];
        const { x1, y1, x2, y2 } = box;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - 22, (label.length + 6) * 8, 22);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.fillText(`${label} ${(confidence * 100).toFixed(0)}%`, x1 + 4, y1 - 6);
      });
    };
  }, [detections, fileId, showOverlay]);

  return (
    <div className="card animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          Object Detection
          <span className="ml-2 badge bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {detections.length} found
          </span>
        </h2>
        <button
          onClick={() => setShowOverlay((v) => !v)}
          className="btn-secondary text-xs"
        >
          {showOverlay ? "Hide" : "Show"} Overlay
        </button>
      </div>

      {showOverlay && (
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-gray-100 dark:border-gray-800"
        />
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {detections.map(({ label, confidence, box }, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="font-medium capitalize text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-violet-500"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
