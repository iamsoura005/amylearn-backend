import { lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';

const MermaidDiagram = lazy(() => import('@/components/common/MermaidDiagram'));

const prepare = (content = '') =>
  String(content)
    .replace(/:::MERMAID_Start:::([\s\S]*?):::MERMAID_End:::/g, (_, code) => `\n\`\`\`mermaid\n${code.trim()}\n\`\`\`\n`)
    .replace(/:{3,}MERMAID_Start:{3,}/g, '```mermaid')
    .replace(/:{3,}MERMAID_End:{3,}/g, '```');

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
    return <pre>{children}</pre>;
  },
  code({ className, children, ...props }) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a({ children, href }) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto">
        <table>{children}</table>
      </div>
    );
  }
};

export const MarkdownBlock = ({ content = '', className = '' }) => (
  <div className={`prose-ai ${className}`}>
    <ReactMarkdown components={components}>{prepare(content)}</ReactMarkdown>
  </div>
);

export default MarkdownBlock;
