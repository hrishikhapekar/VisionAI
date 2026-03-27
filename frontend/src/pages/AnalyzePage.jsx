import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Sparkles, ScanSearch, MessageSquare, FlaskConical, ImagePlus } from "lucide-react";
import DropZone from "../components/DropZone";
import Spinner from "../components/Spinner";
import CaptionPanel from "../components/CaptionPanel";
import DetectionPanel from "../components/DetectionPanel";
import VQAPanel from "../components/VQAPanel";
import { uploadImage, generateCaptions, detectObjects, getImageUrl } from "../services/api";

const TECH_BADGES = [
  { label: "BLIP Captioning", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { label: "BLIP VQA", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
  { label: "DETR Object Detection", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { label: "FastAPI Backend", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  { label: "PyTorch", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  { label: "HuggingFace Transformers", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
];

const DEMO_SAMPLES = [
  { label: "Street Scene", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" },
  { label: "Wildlife",     url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80" },
  { label: "Food",         url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80" },
  { label: "Sports",       url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80" },
];

const SESSION_KEY = "visionai_result";
const HISTORY_KEY = "visionai_history";

const saveToHistory = (record) => {
  const existing = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
  existing.unshift({ ...record, created_at: new Date().toISOString() });
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(existing.slice(0, 50)));
};

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [captions, setCaptions] = useState(null);
  const [detections, setDetections] = useState(null);

  // Restore last session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const { fileId, captions, detections } = JSON.parse(saved);
      setFileId(fileId);
      setPreviewUrl(getImageUrl(fileId));
      if (captions) setCaptions(captions);
      if (detections) setDetections(detections);
    }
  }, []);

  // Persist to sessionStorage whenever results change
  useEffect(() => {
    if (!fileId) return;
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ fileId, captions, detections })
    );
  }, [fileId, captions, detections]);

  const handleFile = (f) => {
    setFile(f);
    setFileId(null);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
    setCaptions(null);
    setDetections(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handleSample = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const f = new File([blob], "sample.jpg", { type: "image/jpeg" });
      handleFile(f);
    } catch {
      toast.error("Failed to load sample image.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadImage(file);
      setFileId(data.file_id);
      setPreviewUrl(getImageUrl(data.file_id));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleCaption = async () => {
    setCaptionLoading(true);
    try {
      const { data } = await generateCaptions(fileId);
      setCaptions(data.captions);
      saveToHistory({ file_id: fileId, action: "caption", result: data.captions });
    } catch {
      toast.error("Caption generation failed.");
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleDetect = async () => {
    setDetectLoading(true);
    try {
      const { data } = await detectObjects(fileId);
      setDetections(data.detections);
      saveToHistory({ file_id: fileId, action: "detect", result: data.detections });
    } catch {
      toast.error("Object detection failed.");
    } finally {
      setDetectLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Smart{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500">
            Visual AI
          </span>{" "}
          Platform
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Upload an image to generate captions, detect objects, and ask questions — all powered by state-of-the-art AI models.
        </p>
        {/* Tech credibility badges */}
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {TECH_BADGES.map(({ label, color }) => (
            <span key={label} className={`badge ${color} text-xs font-medium px-3 py-1`}>
              <FlaskConical size={11} className="mr-1 inline" />{label}
            </span>
          ))}
        </div>
      </div>

      {/* Upload card — hidden once we have a fileId from session */}
      {!fileId && (
        <div className="card animate-slide-up space-y-5">
          {/* Demo samples */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Sparkles size={12} /> Try an example
            </p>
            <div className="grid grid-cols-4 gap-3">
              {DEMO_SAMPLES.map(({ label, url }) => (
                <button
                  key={label}
                  onClick={() => handleSample(url)}
                  className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-violet-500 transition-all"
                >
                  <img src={url} alt={label} className="w-full h-20 object-cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-1.5">
                    <span className="text-white text-xs font-semibold">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">or upload your own</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          <DropZone onFile={handleFile} />
          {file && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full">
              {uploading ? "Uploading…" : "Upload & Analyze"}
            </button>
          )}
          {uploading && <Spinner label="Uploading image…" />}
        </div>
      )}

      {/* Restored session banner */}
      {fileId && !file && (
        <div className="card animate-fade-in flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="current"
              className="w-14 h-14 object-cover rounded-xl"
            />
            <div>
              <p className="font-medium text-sm">Session restored</p>
              <p className="text-xs text-gray-400">Your last image is still active</p>
            </div>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setFileId(null);
              setPreviewUrl(null);
              setCaptions(null);
              setDetections(null);
              sessionStorage.removeItem(SESSION_KEY);
            }}
            className="btn-secondary text-xs"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Action buttons */}
      {fileId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <button
            onClick={handleCaption}
            disabled={captionLoading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            {captionLoading ? "Generating…" : "Generate Captions"}
          </button>
          <button
            onClick={handleDetect}
            disabled={detectLoading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <ScanSearch size={16} />
            {detectLoading ? "Detecting…" : "Detect Objects"}
          </button>
          <button
            disabled
            className="btn-secondary flex items-center justify-center gap-2 opacity-60 cursor-default"
          >
            <MessageSquare size={16} />
            Ask Questions ↓
          </button>
        </div>
      )}

      {captionLoading && <Spinner label="Generating captions with BLIP…" />}
      {captions && <CaptionPanel captions={captions} />}

      {detectLoading && <Spinner label="Running DETR object detection…" />}
      {detections && <DetectionPanel detections={detections} fileId={fileId} />}

      {fileId && <VQAPanel fileId={fileId} />}

      {fileId && (captions || detections) && (
        <div className="flex justify-center pb-4 animate-fade-in">
          <button
            onClick={() => {
              setFile(null);
              setFileId(null);
              setPreviewUrl(null);
              setCaptions(null);
              setDetections(null);
              sessionStorage.removeItem(SESSION_KEY);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm"
          >
            <ImagePlus size={16} />
            Analyze Another Image
          </button>
        </div>
      )}
    </div>
  );
}
