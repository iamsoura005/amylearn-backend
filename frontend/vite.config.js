import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      cytoscape: 'cytoscape/dist/cytoscape.esm.min.mjs'
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // mermaid pre-splits its diagram types into dynamic chunks; forcing
          // them into a manual chunk would merge all 7.9 MB back together.
          if (id.includes('/mermaid/dist/chunks/mermaid.core/')) return undefined;
          const match = id.match(/[\\/]node_modules[\\/](@[^\\/]+[\\/][^\\/]+|[^\\/]+)/);
          if (!match) return undefined;
          const pkg = match[1].replace(/\\/g, '/');

          if (/^(@remix-run\/router|react|react-dom|scheduler|react-router|react-router-dom)$/.test(pkg)) return 'vendor-react';
          if (/^(jspdf|jspdf-autotable|react-pdf|react-to-print|react-qr-code|react-barcode|pdfjs-dist|jsbarcode|qrcode-generator|fast-png|iobuffer|fflate|pako)$/.test(pkg)) return 'vendor-pdf';
          if (/^(framer-motion|motion-dom|motion-utils)$/.test(pkg)) return 'vendor-motion';
          if (/^lucide-react$/.test(pkg)) return 'vendor-icons';
          if (/^(axios|date-fns|uuid)$/.test(pkg)) return 'vendor-utils';

          // Mermaid stack — lazy-loaded with the MermaidDiagram component.
          // The parser, cytoscape and the per-diagram chunks stay unassigned so
          // Rollup keeps them as separate on-demand chunks.
          if (/^d3(?:-[a-z0-9-]+)?$/.test(pkg)) return 'vendor-d3';
          if (/^(lodash-es|es-toolkit|ts-dedent)$/.test(pkg)) return 'vendor-mermaid-utils';
          if (/^(mermaid|dagre-d3-es|dompurify|khroma|stylis|dayjs|@iconify\/utils|@braintree\/sanitize-url|canvg|svg-pathdata|stackblur-canvas|rgbcolor|delaunator|robust-predicates|fast-json-stable-stringify|fastdom|raf|performance-now|@types\/d3[a-z-]*|marked|roughjs|@upsetjs\/venn.js|d3-sankey)$/.test(pkg)) return 'vendor-mermaid';

          if (/^(react-markdown|remark-[a-z-]+|rehype-[a-z-]+|unified|micromark[a-z-]*|mdast-util-[a-z-]+|hast-util-[a-z-]+|unist-util-[a-z-]+|vfile[a-z-]*|property-information|web-namespaces|html-void-elements|space-separated-tokens|comma-separated-tokens|zwitch|bail|trough|devlop|ccount|longest-streak|markdown-table|decode-named-character-reference|character-entities[a-z-]*|trim-lines|inline-style-parser|style-to-object|hastscript|parse-entities|stringify-entities|character-reference-invalid|is-plain-obj|collapse-white-space|is-alphabetical|is-alphanumerical|is-decimal|is-hexadecimal|is-whitespace-character|is-word-character)$/.test(pkg)) return 'vendor-markdown';

          return undefined;
        }
      }
    }
  }
});
