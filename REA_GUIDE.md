# Reverse Engineer Anything (REA) — Amylearn Integration Guide

REA (Reverse Engineer Anything) is installed and fully configured for Amylearn, both as an **agent MCP toolset** (207+ tools), as a **local skill**, and as a **global CLI utility**.

---

## 1. Verification & Health

To check that REA and the Antigravity integration are healthy:

```bash
# Antigravity IDE registration & tool inventory check
npm run rea:doctor

# Verify the stdio MCP server directly
npm run rea:mcp
```

Both tests report `state: aligned` with 207 MCP tools registered for Antigravity.

---

## 2. Ways to Use REA in Amylearn

### A. Directly with Antigravity / Gemini Agent (Recommended)
You can directly ask the AI agent to reverse engineer, inspect, or audit code:
- *"Use REA to analyze the frontend bundle and list all exported route components."*
- *"Use REA to trace authentication state across frontend and backend."*
- *"Use REA to inspect the live page on http://localhost:5173 and check event listeners and network calls."*
- *"Use REA to compare our source code against the compiled production bundle to spot discrepancies."*

### B. From the Terminal (CLI Commands)
You can run any REA command from the command line:

```bash
# 1. Analyze the compiled production bundle
npm run rea:analyze

# 2. Inspect a specific JavaScript source or bundle file
rea analyze-javascript-application frontend/dist --source-path assets/FacultyDashboard-B-ocn4g9.js --format md

# 3. Inspect a live browser page via Chrome DevTools Protocol (CDP)
rea list-browser-targets http://localhost:9222
rea inspect-web-page http://localhost:9222 <targetId> --include-console-text --include-script-sources

# 4. Trace a feature or function call chain
rea trace-application-feature <seed>

# 5. Search strings, endpoints, or procedures
rea search "/api/v1"
```

---

## 3. Finding Bugs and Errors with REA

1. **Dead Code & Missing Handlers**:
   - `rea analyze-javascript-application frontend/dist` identifies unreferenced exports, unresolved dependencies, and semantic unknown nodes.
2. **Runtime & Dev Server Inspection**:
   - `rea observe-javascript-runtime` connects to Node.js / V8 Inspector to capture live execution, exceptions, and call stacks.
3. **Source vs. Bundle Integrity**:
   - `rea compare-source-to-bundle` verifies that compiled artifacts accurately reflect your source code without unexpected minification or dead branches.

---

## 4. Configuration Reference

- **MCP Configuration**: [`C:\Users\soura\.gemini\config\mcp_config.json`](file:///C:/Users/soura/.gemini/config/mcp_config.json)
- **Local Skill**: [`.agents/skills/rea/SKILL.md`](file:///c:/Users/soura/OneDrive/Desktop/Amylearn/.agents/skills/rea/SKILL.md)
- **Global Skill**: [`C:\Users\soura\.gemini\config\skills\rea/SKILL.md`](file:///C:/Users/soura/.gemini/config/skills/rea/SKILL.md)
