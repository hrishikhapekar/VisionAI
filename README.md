# 🚀 VisionAI – Smart AI Image Captioning & Visual Understanding Platform

A production-level full-stack AI web app that performs advanced visual understanding:
caption generation (6 styles + top-3 beams), object detection with bounding boxes, and chat-style Visual Q&A.

---

## 🧠 AI Models Used

| Task | Model |
|------|-------|
| Image Captioning | `Salesforce/blip-image-captioning-base` |
| Visual Q&A | `Salesforce/blip-vqa-base` |
| Object Detection | `facebook/detr-resnet-50` |

---

## ⚙️ Tech Stack

- **Backend**: Python · FastAPI · HuggingFace Transformers · PyTorch · Pillow
- **Frontend**: React (Vite) · Tailwind CSS v3 · Axios · Framer Motion
- **Storage**: In-memory (server-side) + sessionStorage (client-side) — no database required

---

## 📁 Project Structure

```
Caption/
├── backend/
│   ├── main.py               # FastAPI app entry point
│   ├── models/__init__.py    # Loads all AI models once at startup
│   ├── routes/
│   │   ├── upload.py         # POST /upload
│   │   ├── caption.py        # POST /caption
│   │   ├── detect.py         # POST /detect
│   │   ├── ask.py            # POST /ask  (VQA)
│   │   └── history.py        # GET  /history
│   ├── services/
│   │   ├── caption_service.py
│   │   ├── detection_service.py
│   │   └── vqa_service.py
│   ├── utils/
│   │   ├── image_utils.py    # Preprocessing, validation
│   │   └── db.py             # In-memory history store
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/       # Navbar, DropZone, CaptionPanel, DetectionPanel, VQAPanel, Spinner
    │   ├── pages/            # AnalyzePage, HistoryPage
    │   ├── services/api.js   # Axios API layer
    │   └── context/ThemeContext.jsx
    ├── .env
    └── vercel.json
```

---

## 🗄️ Storage Behavior

This app uses **no database**. Storage works at two levels:

| Layer | What it stores | Lifetime |
|-------|---------------|----------|
| Backend in-memory (`db.py`) | All analysis history (captions, detections, VQA) | Until server restarts |
| Frontend sessionStorage | Last analyzed image + results | Until tab is closed |

- Reloading the page within the same tab **restores** your last result automatically via sessionStorage
- Opening a new tab or closing the browser starts fresh
- Redeploying or restarting the backend clears all history

---

## ▶️ Running Locally

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start server (models download automatically on first run ~1-2 GB)
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## 📡 API Reference

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/upload` | `multipart/form-data` file | Upload & preprocess image |
| POST | `/caption` | `{ file_id }` | Generate all caption styles |
| POST | `/detect` | `{ file_id }` | Detect objects with bounding boxes |
| POST | `/ask` | `{ file_id, question }` | Visual Q&A |
| GET | `/history` | `?limit=20` | Fetch in-memory history records |
| GET | `/uploads/{file_id}.jpg` | — | Serve uploaded image |

---

## 🌐 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   ```
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE_MB=10
   ```
5. Use a **Standard** instance (needs ~2 GB RAM for models)

> ⚠️ Render's filesystem is ephemeral — uploaded images and in-memory history reset on every redeploy. This is expected behavior for this app.

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com
   ```
4. Deploy — `vercel.json` handles SPA routing automatically

### Update CORS before deploying

In `backend/main.py`, add your Vercel URL to `allow_origins`:

```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app",  # add this
],
```

---

## ⚡ Performance Tips

- Models are loaded **once** at startup — subsequent requests are fast
- Use a **GPU instance** on Render/Railway for 10-20× faster inference
- Images are auto-resized to max 1024px before inference
- Set `PYTORCH_NO_CUDA_MEMORY_CACHING=1` on CPU-only servers to reduce RAM

---

## 🔒 Security Notes

- File type and size validated server-side before processing
- Uploaded files stored with UUID names (no original filename used)
- CORS restricted to known origins — update `allow_origins` in `main.py` for production
