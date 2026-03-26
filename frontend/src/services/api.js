import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 120000,
});

export const uploadImage = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form);
};

export const generateCaptions = (file_id) =>
  api.post("/caption", { file_id });

export const detectObjects = (file_id) =>
  api.post("/detect", { file_id });

export const askQuestion = (file_id, question) =>
  api.post("/ask", { file_id, question });

export const getHistory = (limit = 20) =>
  api.get("/history", { params: { limit } });

export const getImageUrl = (file_id) =>
  `${api.defaults.baseURL}/uploads/${file_id}.jpg`;

export default api;
