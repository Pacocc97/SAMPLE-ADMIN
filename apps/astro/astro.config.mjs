import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  output: "server",
  // output: 'hybrid',
  integrations: [solidJs(), tailwind(), auth()],
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    optimizeDeps: { exclude: ["auth:config"] },
  },
  head: {
    scripts: [
      { src: "https://js.openpay.mx/openpay.v1.min.js" },
      { src: "https://js.openpay.mx/openpay-data.v1.min.js" },
    ],
  },
});
