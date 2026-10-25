'use strict';

/**
 * `npm run audit` — three-part integrity audit.
 *
 *  A. Route map: every handler referenced by routes/ exists on its controller.
 *  B. Schema map: every Prisma model carries an @@map table name and the
 *     canonical provider is cockroachdb.
 *  C. Brand hygiene: whitelist-driven scan of emails, URLs, session keys and
 *     package names so no legacy naming can slip into the deliverable.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BACKEND_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(BACKEND_DIR, '..');

const issues = [];
const flag = (section, message) => {
  issues.push({ section, message });
  // eslint-disable-next-line no-console
  console.log(`WARN  [${section}] ${message}`);
};
const ok = (message) => {
  // eslint-disable-next-line no-console
  console.log(`OK    ${message}`);
};

function fileExists(relative) {
  return fs.existsSync(path.join(REPO_ROOT, relative));
}

// ---------------------------------------------------------------------------
// A. Route map audit
// ---------------------------------------------------------------------------
function auditRoutes() {
  const routesDir = path.join(BACKEND_DIR, 'routes');
  const controllersDir = path.join(BACKEND_DIR, 'controllers');
  const routeFiles = fs.readdirSync(routesDir).filter((file) => file.endsWith('.js'));
  const controllerCache = new Map();

  const requireController = (name) => {
    if (controllerCache.has(name)) return controllerCache.get(name);
    let controller = null;
    try {
      // eslint-disable-next-line global-require
      controller = require(path.join(controllersDir, `${name}Controller.js`));
    } catch (error) {
      controller = { __missing: true };
    }
    controllerCache.set(name, controller);
    return controller;
  };

  let handlerCount = 0;
  routeFiles.forEach((file) => {
    const source = fs.readFileSync(path.join(routesDir, file), 'utf8');
    const controllerRe = /require\('\.\.\/controllers\/(\w+)Controller'\)/g;
    let match;
    while ((match = controllerRe.exec(source))) {
      const controllerName = match[1];
      const controller = requireController(controllerName);
      if (controller.__missing) {
        flag('routes', `${file} requires controllers/${controllerName}Controller.js which does not exist`);
        continue;
      }
      const usageRe = new RegExp(`\\b${controllerName}\\.(\\w+)`, 'g');
      let usage;
      while ((usage = usageRe.exec(source))) {
        const handler = usage[1];
        if (typeof controller[handler] !== 'function') {
          flag('routes', `${file} → ${controllerName}.${handler} is not exported by ${controllerName}Controller.js`);
        } else {
          handlerCount += 1;
        }
      }
    }
  });
  ok(`Route map: ${routeFiles.length} route modules, ${handlerCount} handler references verified`);
}

// ---------------------------------------------------------------------------
// B. Schema map audit
// ---------------------------------------------------------------------------
function auditSchema() {
  const schema = fs.readFileSync(path.join(BACKEND_DIR, 'prisma', 'schema.prisma'), 'utf8');
  if (!/provider\s*=\s*"cockroachdb"/.test(schema)) {
    flag('schema', 'canonical schema provider is not cockroachdb');
  }
  const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((entry) => entry[1]);
  const mapped = new Set([...schema.matchAll(/@@map\("([^"]+)"\)/g)].map((entry) => entry[1]));
  let unmapped = 0;
  models.forEach((model) => {
    const snake = model
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase();
    const candidates = [snake, `${snake}s`, `${snake}es`, snake.endsWith('y') ? `${snake.slice(0, -1)}ies` : null].filter(Boolean);
    if (!candidates.some((name) => mapped.has(name))) {
      unmapped += 1;
      flag('schema', `model ${model} has no plural @@map matching "${snake}"`);
    }
  });
  if (unmapped === 0) ok(`Schema map: ${models.length} models all carry @@map table names`);
}

// ---------------------------------------------------------------------------
// C. Brand hygiene
// ---------------------------------------------------------------------------
const WHITELIST = {
  email: /^(?:[\w.+-]+@(?:amylearn\.app|amylearn\.demo|student\.nbr\.edu|nbr\.edu|example\.com)|your_gmail@gmail\.com)$/i,
  url: /^(?:https?:\/\/)?(?:localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?|(?:[\w.-]+\.)?cloudinary\.com|\*\.cloudinary\.com|example\.com|amylearn(?:-frontend)?-[a-z0-9-]+\.vercel\.app|amylearn\.vercel\.app|\*\.vercel\.app|[a-z0-9-]+\.hf\.space|\*\.hf\.space|your_|(?:www\.)?youtube\.com(?:\/embed\/)?|player\.vimeo\.com(?:\/video\/)?|www\.w3\.org\/2000\/svg|pdfobject\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/i,
  sessionKey: /^amylearn_(it_session|campus_admin_session|college_session|student_session|landing_version)$/
};

function scanFile(relative, content, section, extractor, whitelistKey) {
  const matches = extractor(content);
  matches.forEach((value) => {
    if (!WHITELIST[whitelistKey].test(value)) {
      flag(section, `${relative}: unapproved ${whitelistKey} value "${value.slice(0, 90)}"`);
    }
  });
}

function auditBrand() {
  const skip = new Set(['node_modules', 'dist', '.git', '.pgdata', 'vibe_images', 'package-lock.json', 'AMYLEARN_REVERSE_ENGINEERING_SPEC.md']);
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|jsx|ts|tsx|json|md|html|css|env|example|prisma)$/.test(entry.name)) {
        files.push(path.relative(REPO_ROOT, full));
      }
    }
  };
  walk(REPO_ROOT);

  const emailRe = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/g;
  const urlRe = /https?:\/\/[^\s"'`<>)]+/g;
  const keyRe = /"(amylearn_(?:it_session|campus_admin_session|college_session|student_session|landing_version))"/g;
  const supportRe = /support@amylearn\.app/;

  let emailCount = 0;
  files.forEach((file) => {
    if (/\.env$/.test(file)) return; // local secrets — presence/ignore coverage checked below
    let content;
    try {
      content = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    } catch (error) {
      return;
    }
    scanFile(file, content, 'brand', (text) => text.match(emailRe) || [], 'email');
    emailCount += (content.match(emailRe) || []).length;
    scanFile(file, content, 'brand', (text) => text.match(urlRe) || [], 'url');
    scanFile(file, content, 'brand', (text) => [...text.matchAll(keyRe)].map((entry) => entry[1]), 'sessionKey');
    if (/@[\w.-]+\.[a-z]{2,}/i.test(content) && !supportRe.test(content) && file.includes('README')) {
      flag('brand', `${file}: README mentions an address outside the AmyLearn support domain`);
    }
  });
  ok(`Brand hygiene: scanned ${files.length} files (${emailCount} email literals checked against the whitelist)`);

  // Env hygiene — a real .env is acceptable only when the repo's .gitignore covers it.
  const envFiles = files.filter((file) => /\.env(?:\..*)?$/.test(file) && !file.endsWith('.env.example'));
  if (envFiles.length) {
    const gitignorePath = path.join(REPO_ROOT, '.gitignore');
    let patterns = [];
    if (fs.existsSync(gitignorePath)) {
      patterns = fs
        .readFileSync(gitignorePath, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
    }
    const ignored = (file) => {
      const normalized = file.replace(/\\/g, '/');
      return patterns.some((pattern) => {
        if (pattern.startsWith('!')) return false;
        const body = pattern.replace(/^\//, '').replace(/\/$/, '');
        const regex = new RegExp(`(^|/)${body.replace(/\./g, '\\.').replace(/\*/g, '[^/]*')}$`);
        return regex.test(normalized);
      });
    };
    const uncovered = envFiles.filter((file) => !ignored(file));
    if (uncovered.length) {
      uncovered.forEach((file) => flag('brand', `${file}: real env file present but not covered by .gitignore`));
    } else {
      ok(`Env hygiene: ${envFiles.length} local env file(s) covered by .gitignore`);
    }
  } else {
    ok('Env hygiene: no real .env files in the tracked tree');
  }

  // Package names
  ['backend/package.json', 'frontend/package.json'].forEach((file) => {
    if (!fileExists(file)) {
      flag('brand', `${file} missing`);
      return;
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, file), 'utf8'));
    const expected = file.startsWith('backend') ? 'amylearn-backend' : 'amylearn-frontend';
    if (pkg.name !== expected) flag('brand', `${file}: package name is "${pkg.name}", expected "${expected}"`);
    else ok(`${file}: name "${pkg.name}"`);
  });

  // Git freshness (spawnSync — no shell, so % tokens survive on Windows).
  try {
    const result = spawnSync('git', ['log', '--format=%an%x09%ae'], { cwd: REPO_ROOT, encoding: 'utf8' });
    if (result.error || result.status !== 0) throw new Error('git unavailable');
    const authors = [...new Set(result.stdout.split(/\r?\n/).filter(Boolean))];
    ok(`Git history: ${authors.length} unique author(s) — ${authors.join(', ') || 'fresh repository'}`);
  } catch (error) {
    ok('Git history: not available (fresh repository or git not initialised)');
  }
}

function main() {
  // eslint-disable-next-line no-console
  console.log('AmyLearn audit\n==============');
  auditRoutes();
  auditSchema();
  auditBrand();
  // eslint-disable-next-line no-console
  console.log(`\n${issues.length} warning(s).`);
  process.exit(issues.length ? 1 : 0);
}

main();
