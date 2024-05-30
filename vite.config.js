import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Portfolio/",
  resolve: {
    alias: {
      src: "/src",
      lib: "/lib",
      components: "/src/components",
      assets: "/src/assets",
      utils: "/utils",
    },
  },
});
