import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Copy,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

let initialized = false;
const ensureMermaid = () => {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    htmlLabels: false, // Pure SVG text elements for consistent scaling across renderers
    flowchart: {
      htmlLabels: false,
      useMaxWidth: false,
      curve: 'basis',
      nodeSpacing: 35,
      rankSpacing: 45
    },
    theme: 'base',
    fontFamily: 'Arial, Helvetica, sans-serif',
    themeVariables: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      primaryColor: '#EEF4FF',
      primaryTextColor: '#0A1F44',
      primaryBorderColor: '#3B82F6',
      lineColor: '#64748B',
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
 * 1. Automatically converts wide top-down graphs (graph TD/TB) to Left-to-Right (graph LR)
 *    so mind maps flow cleanly without exploding horizontally into flat bar-graph slivers.
 * 2. Fixes em-dashes (—) and en-dashes (–) in connection arrows and text.
 * 3. Quotes unquoted node labels with special characters (parentheses, colons, slashes).
 * 4. Strips duplicate headers and backtick fences.
 */
export const sanitizeMermaidSource = (raw = '') => {
  let text = String(raw || '').trim();
  // Strip markdown code fences if wrapped
  text = text.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Strip duplicate Mermaid line
  text = text.split('\n').filter((l) => !/^mermaid\s*$/i.test(l.trim())).join('\n').trim();

  // Convert wide top-down graphs to Left-to-Right (LR) so mind maps never flatten into thin bar-graphs
  text = text.replace(/(?:^|\n)\s*(?:graph|flowchart)\s+(?:TD|TB)\b/gi, (match) => match.startsWith('\n') ? '\ngraph LR' : 'graph LR');

  // Fix em-dashes and en-dashes inside connection arrows
  text = text.replace(/[\u2014\u2013]{2,}>/g, '-->');
  text = text.replace(/[\u2014\u2013]>/g, '-->');
  text = text.replace(/[\u2014\u2013]{2,}/g, '---');
  text = text.replace(/[\u2014\u2013]/g, '-');

  // Strip duplicate headers like graph LR\nflowchart LR or graph LR\nmindmap
  text = text.replace(/^\s*graph\s+[A-Z]{2}\s+(graph|flowchart|mindmap)/i, '$1');

  // Ensure diagram type header exists; default to graph LR for optimal readability
  const isKnownType = /^\s*(graph|flowchart|mindmap|classDiagram|sequenceDiagram|erDiagram|gantt|pie|gitGraph|stateDiagram)\b/im.test(text);
  if (!isKnownType) {
    text = `graph LR\n${text}`;
  }

  // Quote unquoted node labels with special characters (parentheses, colons, slashes, dashes, commas)
  // E.g. A[Aarav (CSE) - Photosynthesis] => A["Aarav (CSE) - Photosynthesis"]
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
  const [isExpanded, setIsExpanded] = useState(false);
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
        // Sanitize with full support for SVG tags, text, styling
        let sanitized = '';
        try {
          sanitized = DOMPurify.sanitize(output, {
            USE_PROFILES: { svg: true, svgFilters: true, html: true },
            ADD_TAGS: [
              'foreignObject', 'div', 'span', 'p', 'style', 'text', 'tspan',
              'b', 'strong', 'i', 'em', 'br', 'marker', 'defs', 'line',
              'polygon', 'polyline', 'rect', 'circle', 'path', 'g'
            ],
            ADD_ATTR: [
              'dominant-baseline', 'text-anchor', 'transform', 'style',
              'viewBox', 'width', 'height', 'x', 'y', 'class', 'id',
              'fill', 'stroke', 'stroke-width', 'd', 'xmlns', 'preserveAspectRatio',
              'marker-end', 'marker-start', 'refX', 'refY', 'markerWidth', 'markerHeight', 'orient'
            ]
          });
        } catch {
          sanitized = output;
        }
        setSvg(sanitized && sanitized.includes('<svg') ? sanitized : output);
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
    <>
      <div className={`rounded-2xl border border-indigo-100/90 bg-white p-3.5 shadow-xs ${className}`}>
        {/* Diagram Header with Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
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
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
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

            {/* Expand / Fullscreen button */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              title="Expand to full screen"
              className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
            >
              <Maximize2 size={11} />
              <span className="hidden sm:inline">Expand</span>
            </button>

            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Copy diagram code"
              className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-white hover:text-indigo-600 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Syntax button */}
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
              width: `${Math.round(zoom * 100)}%`,
              minWidth: '100%',
              display: 'flex',
              justifyContent: 'center',
              transition: 'width 0.15s ease'
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

      {/* Fullscreen Expand Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6 animate-in fade-in duration-200">
          <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers size={14} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mind Map & Concept Diagram</h3>
                  <p className="text-[10px] text-slate-500">Interactive study canvas · Pan and zoom to revise</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls inside modal */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-slate-600 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                    title="Zoom out"
                    className="rounded p-1 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="px-2 text-[10px] font-bold tabular-nums text-slate-600">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.2).toFixed(1))))}
                    title="Zoom in"
                    className="rounded p-1 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    title="Reset zoom"
                    className="rounded p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 shadow-2xs transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy syntax'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body Canvas */}
            <div className="mermaid flex-1 overflow-auto bg-slate-50/40 p-6">
              <div
                style={{
                  width: `${Math.round(zoom * 100)}%`,
                  minWidth: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  transition: 'width 0.15s ease'
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidDiagram;
