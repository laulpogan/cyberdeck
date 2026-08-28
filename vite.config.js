// The showcase app's build.
//
// Two things about this file are load-bearing.
//
// 1. The app imports the library *in place* — `../../src/tokens.css`,
//    `../../src/runtime.js`, `../../vendor/motion.min.js` — with `fs.allow`
//    opened to the repo rather than a copied twin inside `app/`. A showcase
//    that renders a copy of the library proves nothing about the copy nobody
//    looks at.
//
// 2. The root is `app/`, not the repository. The library's own React shim
//    lives at `<repo>/react/index.js`, and with the Vite root at the repo a
//    bare `import ... from 'react'` resolves to *that directory* before it
//    resolves to the npm package: the dep pre-bundle came out containing
//    `src/marks.js`, and every page died with "does not provide an export
//    named 'useEffect'". Rooting at `app/` puts a directory boundary between
//    the two, which is the difference between a name collision and a build.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'app',
  base: './',
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
    fs: { allow: ['..'] },
  },
  preview: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
