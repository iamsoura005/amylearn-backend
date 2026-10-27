import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { Check, ChevronDown, ChevronUp, Code, Copy, Layers, RotateCcw, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

let initialized = false;
const ensureMermaid = () => {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    htmlLabels: false, // Forces pure SVG <text> and <tspan> so node labels never get stripped
    flowchart: {
      htmlLabels: false,
      useMaxWidth: false,
      curve: 'basis',
      nodeSpacing: 40,
      rankSpacing: 45
    },
    theme: 'base',
    fontFamily: 'Arial, Helvetica, sans-serif',
    themeVariables: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      primaryColor: '#EEF4FF',
      primaryTextColor: '#0A1F44',
      primaryBorderColor: '#3B82F6',
      lineColor: '#475569',
      secondaryColor: '#F5F3FF',
      tertiaryColor: '#ECFDF5',
      mainBkg: '#EEF4FF',
      nodeBorder: '#3B82F6',
      textColor: '#0A1F44'
    }
  });
  initialized = true;
};

/**
 * Auto-repairs and sanitizes common Mermaid diagram syntax errors:
 * 1. Unquoted parentheses, colons, slashes inside node brackets
 * 2. Em-dashes or en-dashes inside arrows (e.g. A ——> B)
 * 3. Double diagram headers (e.g. graph TD\nmindmap)
 * 4. Missing diagram type declarations
 */
export const sanitizeMermaidSource = (raw = '') => {
  let text = String(raw || '').trim();
  // Strip backticks if wrapped
  text = text.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Strip duplicate Mermaid line
  text = text.split('\n').filter((l) => !/^mermaid\s*$/i.test(l.trim())).join('\n').trim();

  // Fix em-dashes and en-dashes inside connection arrows
  text = text.replace(/[\u2014\u2013]{2,}>/g, '-->');
  text = text.replace(/[\u2014\u2013]>/g, '-->');
  text = text.replace(/[\u2014\u2013]{2,}/g, '---');
  text = text.replace(/[\u2014\u2013]/g, '-');

  // Strip duplicate headers like graph TD\nflowchart TD or graph TD\nmindmap
  text = text.replace(/^\s*graph\s+[A-Z]{2}\s+(graph|flowchart|mindmap)/i, '$1');

  // Ensure diagram type header exists
  const isKnownType = /^\s*(graph|flowchart|mindmap|classDiagram|sequenceDiagram|erDiagram|gantt|pie|gitGraph|stateDiagram)\b/i.test(text);
  if (!isKnownType) {
    text = `graph TD\n${text}`;
  }

  // Quote unquoted node labels with special characters (parentheses, colons, slashes, dashes, commas)
  // E.g. A[Aarav (CSE) - TCP Congestion Control] => A["Aarav (CSE) - TCP Congestion Control"]
  text = text.replace(/(\b[A-Za-z0-9_]+)\s*\[\s*([^"\]\n]+?)\s*\]/g, (match, id, label) => {
    if (label.startsWith('"') && label.endsWith('"')) return match;
    const cleanLabel = label.replace(/"/g, "'").trim();
    return `${id}["${cleanLabel}"]`;
  });

  return text.trim();
};

/**
 * Fallback parser that transforms a failed diagram into an elegant visual concept card tree
 */
const FallbackConceptTree = ({ rawCode, onShowCode, showCode }) => {
  // Extract node connections: A["Label"] --> B["Label"]
  const lines = rawCode.split('\n').map((l) => l.trim()).filter((l) => l && !/^(graph|flowchart|mindmap)/i.test(l));
  const connections = [];

  for (const line of lines) {
    const match = line.match(/(?:([A-Za-z0-9_]+)(?:\["?(.*?)"?\])?)?\s*(-->|---|->)\s*(?:([A-Za-z0-9_]+)(?:\["?(.*?)"?\])?)/);
    if (match) {
      const from = (match[2] || match[1] || '').trim();
      const to = (match[5] || match[4] || '').trim();
      if (from || to) {
        connections.push({ from: from || 'Concept', to: to || 'Detail' });
      }
    } else {
      const item = line.replace(/^[-*•\d.]+\s*/, '').replace(/[\[\]"']/g, '').trim();
      if (item && item.length > 2) {
        connections.push({ from: 'Topic', to: item });
      }
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100/60 mb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500 text-white shadow-xs">
            <Layers size={14} />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-800">Visual Concept Map</p>
            <p className="text-[10px] text-slate-500">Structured study tree</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onShowCode}
          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Code size={11} />
          {showCode ? 'Hide syntax' : 'View syntax'}
          {showCode ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {connections.length > 0 ? (
        <div className="space-y-2">
          {connections.slice(0, 14).map((conn, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg bg-white border border-indigo-200/80 px-2.5 py-1 font-semibold text-indigo-900 shadow-2xs">
                {conn.from}
              </span>
              <span className="text-indigo-400 font-bold">→</span>
              <span className="rounded-lg bg-indigo-50/80 border border-indigo-100 px-2.5 py-1 text-slate-700">
                {conn.to}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Structured mind map concept tree</p>
      )}

      {showCode && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100">
          <code>{rawCode}</code>
        </pre>
      )}
    </div>
  );
};

export const MermaidDiagram = ({ code = '', className = '' }) => {
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.random().toString(36).slice(2, 7)}`;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    ensureMermaid();
    const source = sanitizeMermaidSource(code);
    if (!source) return undefined;

    mermaid
      .render(id, source)
      .then(({ svg: output }) => {
        if (!mounted.current) return;
        // Sanitize with full support for SVG tags, text, and optional foreignObject
        const sanitized = DOMPurify.sanitize(output, {
          USE_PROFILES: { svg: true, svgFilters: true, html: true },
          ADD_TAGS: ['foreignObject', 'div', 'span', 'p', 'style', 'text', 'tspan'],
          ADD_ATTR: [
            'dominant-baseline',
            'text-anchor',
            'transform',
            'style',
            'viewBox',
            'width',
            'height',
            'x',
            'y',
            'class',
            'id',
            'fill',
            'stroke',
            'stroke-width',
            'd'
          ]
        });
        setSvg(sanitized);
        setError(false);
      })
      .catch((err) => {
        console.warn('[MermaidDiagram] Render warning:', err?.message || err);
        if (mounted.current) setError(true);
      });

    return () => {
      mounted.current = false;
      const stale = document.getElementById(`d${id}`);
      if (stale) stale.remove();
    };
  }, [code, id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <FallbackConceptTree
        rawCode={code}
        showCode={showCode}
        onShowCode={() => setShowCode((prev) => !prev)}
      />
    );
  }

  if (!svg) {
    return (
      <div className={`flex min-h-[140px] items-center justify-center rounded-2xl border border-dashed border-indigo-200/80 bg-indigo-50/30 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-indigo-600">
          <Sparkles size={14} className="animate-spin" />
          <span className="text-[11px] font-semibold">Generating mind map diagram…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-indigo-100/90 bg-white p-3.5 shadow-xs ${className}`}>
      {/* Diagram Header with Controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-800">
          <span className="grid h-5 w-5 place-items-center rounded bg-indigo-50 text-indigo-600">
            <Layers size={12} />
          </span>
          <span className="text-[11px] font-bold">Mind Map & Concept Diagram</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-200/80 bg-slate-50 p-0.5 text-slate-600">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
              title="Zoom out"
              className="rounded p-1 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomOut size={12} />
            </button>
            <span className="px-1.5 text-[9px] font-bold tabular-nums text-slate-500">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.2).toFixed(1))))}
              title="Zoom in"
              className="rounded p-1 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ZoomIn size={12} />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                title="Reset zoom"
                className="rounded p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <RotateCcw size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy diagram code"
            className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCode((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
          >
            <Code size={11} />
            <span>{showCode ? 'Hide' : 'Syntax'}</span>
          </button>
        </div>
      </div>

      {/* SVG Container with Zoom & Scroll */}
      <div className="mermaid overflow-x-auto py-2">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease'
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      {showCode && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default MermaidDiagram;
