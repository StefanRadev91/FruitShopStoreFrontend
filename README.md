# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Тестове

```bash
npm test            # unit тестове (Vitest + Testing Library) – ~15 s
npm run test:e2e    # end-to-end (Playwright, Chromium): build + preview, бекендът е подменен
npm run test:all    # и двете
```

- Unit тестовете са до кода (`*.test.js(x)`): цени и количка, каталог/API, любими, хукове, error boundary, тема.
- E2E тестовете са в `e2e/`. Те **не** викат истинското API (Render) – `e2e/fixtures.js` подменя Strapi и Cloudinary, затова са бързи и стабилни.
  Покриват: начална страница (скорост/CLS), количка и поръчка, търсене, любими, категории и продукт, достъпност (axe) и устойчивост при счупени чънкове/API.
- Първо пускане на Playwright: `npx playwright install chromium` (и `--with-deps` на чиста Linux машина).
