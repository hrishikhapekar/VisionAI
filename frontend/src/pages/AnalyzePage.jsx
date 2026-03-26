import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Sparkles, ScanSearch, MessageSquare } from "lucide-react";
import DropZone from "../components/DropZone";
import Spinner from "../components/Spinner";
import CaptionPanel from "../components/CaptionPanel";
import DetectionPanel from "../components/DetectionPanel";
import VQAPanel from "../components/VQAPanel";
import { uploadImage, generateCaptions, detectObjects, getImageUrl } from "../services/api";

const SESSION_KEY = "visionai_result";

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
    } catch {
      toast.error("Object detection failed.");
    } finally {
      setDetectLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 animate-fade-in">
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
      </div>

      {/* Upload card — hidden once we have a fileId from session */}
      {!fileId && (
        <div className="card animate-slide-up space-y-4">
          <h2 className="font-semibold text-lg">Upload Image</h2>
          <DropZone onFile={handleFile} />
          {file && (
            <button onClick={handleUpload} disabled={uploading} className="btn-primary w-full">
              {uploading ? "Uploading…" : "Upload & Prepare"}
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
    </div>
  );
}
