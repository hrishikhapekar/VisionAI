import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "dark:bg-gray-800 dark:text-white text-sm",
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}
