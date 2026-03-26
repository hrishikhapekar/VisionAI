import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { askQuestion } from "../services/api";
import toast from "react-hot-toast";

const SUGGESTIONS = [
  "What is happening in this image?",
  "How many people are there?",
  "What color is the main object?",
  "What is the setting or location?",
  "Is there any text visible?",
];

export default function VQAPanel({ fileId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (question) => {
    const q = (question || input).trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { data } = await askQuestion(fileId, q);
      setMessages((m) => [...m, { role: "ai", text: data.answer }]);
    } catch {
      toast.error("Failed to get answer. Try again.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Visual Q&amp;A</h2>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={loading}
            className="text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1.5 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-3 min-h-[120px] max-h-72 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-6">
            Ask anything about the image above ☝️
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === "user"
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`text-sm px-4 py-2.5 rounded-2xl max-w-[80%] ${
                m.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the image…"
          disabled={loading}
          className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-4 py-2.5"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
