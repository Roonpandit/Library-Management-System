import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",  // ✅ Ensures correct asset paths
  build: {
    outDir: "dist",  // ✅ Ensure correct build output
  },
  server: {
    port: 5173, // Optional: Set a custom local port
  }
});