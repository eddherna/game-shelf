import { defineConfig } from "@previewjs/config";

export default defineConfig({
  "framework": "react",
  "bundler": "vite",
  "vite": {
    "configFile": "vite.config.ts" 
  },
  "wrapper": {
    "path": "src/PreviewWrapper.tsx"
  }
});