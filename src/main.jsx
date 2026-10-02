import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
        headings: { fontFamily: "Manrope, Inter, system-ui, sans-serif", fontWeight: "800" },
        primaryColor: "green",
      }}
    >
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>
);
