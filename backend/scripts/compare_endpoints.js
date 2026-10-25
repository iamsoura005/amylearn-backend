'use strict';

/**
 * `npm run compare` — extracts every endpoint path from the frontend
 * `apiEndpoints.js` registry, collects every path the backend Express app
 * actually registers, and reports which frontend paths have no matching
 * backend route.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_ENDPOINTS = path.resolve(__dirname, '..', '..', 'frontend', 'src', 'utils', 'apiEndpoints.js');

function normalizePath(raw) {
  let value = String(raw).trim();
  value = value.replace(/\$\{q\((\w+)\)\}/g, ':$1');
  value = value.replace(/\$\{(\w+)\}/g, ':$1');
  value = value.replace(/['"`]/g, '');
  value = value.replace(/\/+/g, '/');
  if (value.length > 1 && value.endsWith('/')) value = value.slice(0, -1);
  return value;
}

function extractFrontendPaths() {
  const source = fs.readFileSync(FRONTEND_ENDPOINTS, 'utf8');
  const candidates = new Set();
  const templateRe = /`([^`]+)`/g;
  let match;
  while ((match = templateRe.exec(source))) {
    const raw = match[1];
    if (raw.includes('/api') || raw.includes('/it-') || raw.includes('/session')) candidates.add(raw);
  }
  const plainRe = /'(\/[^']*\/[^']*)'/g;
  while ((match = plainRe.exec(source))) {
    const raw = match[1];
    if (raw.includes('/api') || raw.includes('/it-') || raw.includes('/session')) candidates.add(raw);
  }
  const paths = new Set();
  candidates.forEach((raw) => {
    const normalized = normalizePath(raw);
    if (normalized.startsWith('/')) paths.add(normalized);
  });
  return Array.from(paths).sort();
}

function extractMountPath(layer) {
  if (!layer || !layer.regexp || !layer.regexp.source) return '';
  const source = layer.regexp.source;
  if (!source.startsWith('^\\/')) return '';
  let body = source.slice(3);
  const lookahead = body.indexOf('(?=');
  if (lookahead !== -1) body = body.slice(0, lookahead);
  body = body.replace(/\\\/(\?)?$/, '');
  body = body.replace(/\\\//g, '/');
  if (!body || body === '?') return '';
  return `/${body}`;
}

function collectBackendRoutes(app) {
  const found = [];
  const walk = (stack, base = '') => {
    for (const layer of stack) {
      if (!layer) continue;
      if (layer.route) {
        Object.keys(layer.route.methods)
          .filter((method) => layer.route.methods[method])
          .forEach((method) => {
            const full = `${base}${layer.route.path}`.replace(/\/+/g, '/');
            found.push({ method: method.toUpperCase(), path: full || '/' });
          });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        walk(layer.handle.stack, `${base}${extractMountPath(layer)}`);
      }
    }
  };
  walk(app._router.stack);
  return found;
}

function pathToRegex(pattern) {
  const escaped = pattern
    .split('/')
    .map((segment) => (segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^${escaped}/?$`);
}

function main() {
  const frontendPaths = extractFrontendPaths();
  const app = require('../server');
  const backendRoutes = collectBackendRoutes(app);

  // eslint-disable-next-line no-console
  console.log(`Frontend registry: ${frontendPaths.length} paths`);
  // eslint-disable-next-line no-console
  console.log(`Backend routes:    ${backendRoutes.length} (${new Set(backendRoutes.map((route) => route.path)).size} unique paths)\n`);

  const backendPatterns = backendRoutes.map((route) => pathToRegex(route.path));
  const missing = [];
  frontendPaths.forEach((frontendPath) => {
    const matches = backendPatterns.some((regex) => regex.test(frontendPath));
    if (!matches) missing.push(frontendPath);
  });

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.log('Frontend paths with NO backend route:');
    missing.forEach((entry) => {
      // eslint-disable-next-line no-console
      console.log(`  - ${entry}`);
    });
  } else {
    // eslint-disable-next-line no-console
    console.log('Every frontend endpoint has a matching backend route.');
  }

  // eslint-disable-next-line no-console
  console.log(`\nCoverage: ${frontendPaths.length - missing.length}/${frontendPaths.length}`);
  process.exit(missing.length ? 1 : 0);
}

main();
