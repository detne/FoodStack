import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import API test utilities for development
if (import.meta.env.DEV) {
  import('./lib/api-test');
}

createRoot(document.getElementById("root")!).render(<App />);
