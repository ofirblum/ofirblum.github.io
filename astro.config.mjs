import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import alpinejs from "@astrojs/alpinejs";
import icon from "astro-icon";

export default defineConfig({
  site: 'https://oblum.be',
  markdown: {
    shikiConfig: {
      theme: 'solarized-light',
    }
  },
  integrations: [tailwind(), alpinejs(), icon()],
  vite: {
    ssr: {
      external: ["svgo"]
    }
  }
});
