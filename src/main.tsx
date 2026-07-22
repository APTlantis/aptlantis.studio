import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerAptlantisWebMcpTools } from "./utils/webMcp";

const rootElement = document.getElementById("root");

registerAptlantisWebMcpTools();

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Root element not found. Failed to render the application.");
}
