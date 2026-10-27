import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

let initialized = false;
const ensureMermaid = () => {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'Arial, Helvetica, sans-serif',
    themeVariables: {
      primaryColor: '#EEF4FF',
      primaryTextColor: '#0A1F44',
      primaryBorderColor: '#8DB4FF',
      lineColor: '#64748B',
      secondaryColor: '#F4F0FF',
      tertiaryColor: '#ECFDF5',
      fontSize: '13px'
    }
  });
  initialized = true;
};

export const MermaidDiagram = ({ code = '', className = '' }) => {
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.random().toString(36).slice(2, 7)}`;
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    ensureMermaid();
    const source = code.trim();
    if (!source) return undefined;
    mermaid
      .render(id, source)
      .then(({ svg: output }) => {
        if (!mounted.current) return;
        setSvg(DOMPurify.sanitize(output, { USE_PROFILES: { svg: true, svgFilters: true } }));
        setError(false);
      })
      .catch(() => {
        if (mounted.current) setError(true);
      });
    return () => {
      mounted.current = false;
      const stale = document.getElementById(`d${id}`);
      if (stale) stale.remove();
    };
  }, [code, id]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100">
        <code>{code}</code>
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className={`flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 ${className}`}>
        <span className="text-[10px] font-semibold text-slate-500">Rendering diagram…</span>
      </div>
    );
  }

  return <div className={`mermaid overflow-x-auto rounded-xl bg-white p-2 ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default MermaidDiagram;
