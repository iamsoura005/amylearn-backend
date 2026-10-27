import { lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MermaidDiagram = lazy(() => import('@/components/common/MermaidDiagram'));

const prepare = (content = '') => {
  let text = String(content || '');
  // Normalize Mermaid syntax
  text = text
    .replace(/:::MERMAID_Start:::([\s\S]*?):::MERMAID_End:::/g, (_, code) => `\n\`\`\`mermaid\n${code.trim()}\n\`\`\`\n`)
    .replace(/:{3,}MERMAID_Start:{3,}/g, '```mermaid')
    .replace(/:{3,}MERMAID_End:{3,}/g, '```');

  // Ensure markdown tables always have a blank line before them so GFM table parser activates
  text = text.replace(/([^\n])\n(\|[^\n]+\|\r?\n\|[-:\s|]+\|)/g, '$1\n\n$2');

  // Ensure markdown tables have a blank line after them
  text = text.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');

  return text;
};

const MermaidBlock = ({ code, className = '' }) => (
  <Suspense
    fallback={
      <pre className="my-3 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
        {code}
      </pre>
    }
  >
    <MermaidDiagram code={code} className={className} />
  </Suspense>
);

const components = {
  pre({ children }) {
    const child = Array.isArray(children) ? children[0] : children;
    const className = child?.props?.className || '';
    if (typeof className === 'string' && className.includes('language-mermaid')) {
      return <MermaidBlock code={String(child?.props?.children ?? '')} className="my-3" />;
    }
    return (
      <pre className="my-3 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-900 p-3.5 text-xs text-slate-100 shadow-xs">
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded-md border border-slate-200/70 bg-slate-100 px-1.5 py-0.5 text-[12px] font-mono font-semibold text-brandBlue" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="font-semibold text-brandBlue underline decoration-brandBlue/30 hover:decoration-brandBlue">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-4 w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-[440px] border-collapse text-left text-xs leading-normal">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="border-b border-slate-200 bg-slate-50/90 text-slate-800 font-bold">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-slate-100 text-slate-700">{children}</tbody>;
  },
  tr({ children }) {
    return <tr className="transition-colors hover:bg-slate-50/60">{children}</tr>;
  },
  th({ children }) {
    return (
      <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="px-3.5 py-2.5 text-slate-600 align-top leading-relaxed">{children}</td>;
  },
  h1({ children }) {
    return <h1 className="mt-4 mb-2 text-base font-extrabold text-slate-900 tracking-tight">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="mt-3.5 mb-1.5 text-sm font-extrabold text-slate-900 tracking-tight">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="mt-3 mb-1 text-xs font-bold uppercase tracking-wide text-brandBlue">{children}</h3>;
  },
  p({ children }) {
    return <p className="my-2 text-[13px] leading-relaxed text-slate-700">{children}</p>;
  },
  ul({ children }) {
    return <ul className="my-2.5 ml-4 list-disc space-y-1 text-[13px] text-slate-700">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2.5 ml-4 list-decimal space-y-1 text-[13px] text-slate-700">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-3 rounded-r-xl border-l-4 border-brandBlue bg-blue-50/40 px-3.5 py-2 text-[12.5px] italic text-slate-700">
        {children}
      </blockquote>
    );
  }
};

export const MarkdownBlock = ({ content = '', className = '' }) => (
  <div className={`prose-ai ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {prepare(content)}
    </ReactMarkdown>
  </div>
);

export default MarkdownBlock;
