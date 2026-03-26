import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";

const MAX_MB = 10;

export default function DropZone({ onFile }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (accepted, rejected) => {
      setError("");
      if (rejected.length) {
        setError("Invalid file. Use JPG, PNG, WEBP or BMP under 10 MB.");
        return;
      }
      const file = accepted[0];
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File too large. Max ${MAX_MB} MB.`);
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFile(file);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".bmp"] },
    maxFiles: 1,
  });

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFile(null);
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer
          ${isDragActive ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-gray-200 dark:border-gray-700 hover:border-violet-400"}
          ${preview ? "p-2" : "p-10 flex flex-col items-center justify-center gap-3"}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="preview"
              className="w-full max-h-72 object-contain rounded-xl"
            />
            <button
              onClick={clear}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={40} className="text-violet-400" />
            <div className="text-center">
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                {isDragActive ? "Drop it here!" : "Drag & drop an image"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to browse · JPG, PNG, WEBP, BMP · max {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
