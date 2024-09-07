import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";

export default defineConfig({
  site: 'oblum.be',
  markdown: {
    shikiConfig: {
      theme: 'solarized-light',
    }
  },
  integrations: [tailwind(), alpinejs()],
  vite: {
    ssr: {
      external: ["svgo"]
    }
  }
});