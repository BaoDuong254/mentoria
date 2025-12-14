import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  css: {
    devSourcemap: true,
  },
  // Uncomment the below section to enable proxying API requests to the backend server
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "https://06377cb048ad.ngrok-free.app",
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path,
  //     },
  //   },
  //   allowedHosts: ["56dc833b8f48.ngrok-free.app"],
  // },
});
