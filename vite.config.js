import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { CONTACT_LINE } from './src/config/contact.js'

// Текстът на статичната горна лента (преди JS) идва от същия файл като хедъра – на едно място.
const contactInHtml = () => ({
  name: 'contact-in-html',
  transformIndexHtml: (html) => html.replace('<!--CONTACT_LINE-->', CONTACT_LINE),
})

// Банерите на началната са LCP елемент, но адресите им (с хеш) се знаят едва при билд.
// Инжектираме preload само за "/" (на другите страници не се изтеглят напразно).
const preloadHomeBanners = () => ({
  name: 'preload-home-banners',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.bundle) return html // dev сървър
      const files = Object.keys(ctx.bundle).filter((f) => /^assets\/(office|restorant)-.*\.webp$/.test(f))
      if (files.length === 0) return html
      const script = `if(location.pathname==="/"){${JSON.stringify(files)}.forEach(function(f){var l=document.createElement("link");l.rel="preload";l.as="image";l.href="/"+f;l.setAttribute("fetchpriority","high");document.head.appendChild(l)})}`
      return html.replace('</head>', `<script>${script}</script></head>`)
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contactInHtml(), preloadHomeBanners()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'], // e2e/ е за Playwright
    css: false,
  },
})
