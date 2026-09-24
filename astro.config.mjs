import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://sacredinkacademy.com',
  trailingSlash: 'always',
  output: 'hybrid',
  adapter: vercel(),
});
