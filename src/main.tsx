import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { EnhancedModalProvider } from "@/enhancements/EnhancedModals";

createRoot(document.getElementById("root")!).render(
  <EnhancedModalProvider>
    <App />
  </EnhancedModalProvider>
);
