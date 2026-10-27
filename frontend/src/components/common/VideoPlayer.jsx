import { useState } from 'react';
import { Download, ExternalLink, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const isEmbeddable = (url = '') => /youtube\.com|youtu\.be|vimeo\.com|cloudinary\.com\/video/i.test(url);
const isYouTube = (url = '') => /youtube\.com|youtu\.be/i.test(url);

const toEmbedUrl = (url = '') => {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

export const VideoPlayer = ({
  url,
  title = 'Lecture video',
  subtitle,
  poster,
  downloadEnabled = false,
  duration,
  className = ''
}) => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-deepNavy">{title}</p>
          {subtitle ? <p className="truncate text-[10px] text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {duration ? <Badge tone="slate">{duration}</Badge> : null}
          {downloadEnabled && url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="grid min-h-[44px] min-w-[44px] place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-deepNavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
              aria-label="Download video"
            >
              <Download size={15} />
            </a>
          ) : (
            <Badge tone="amber">View only</Badge>
          )}
        </div>
      </div>
      <div className="relative aspect-video w-full bg-deepNavy">
        {!url ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/60">
            <PlayCircle size={32} />
            <p className="text-[11px] font-semibold">Video coming soon</p>
          </div>
        ) : isEmbeddable(url) ? (
          <iframe
            src={toEmbedUrl(url)}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            controls
            playsInline
            poster={poster}
            className="h-full w-full object-cover"
          >
            <source src={url} />
          </video>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">lock</span>
          Streamed from your campus media library
        </span>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brandBlue hover:underline">
            Open source <ExternalLink size={11} />
          </a>
        ) : null}
      </div>
    </div>
  );
};

export const PdfViewer = ({ url, title = 'Document', className = '', downloadEnabled = true }) => (
  <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-red-50 text-red-600">
          <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
        </span>
        <p className="truncate text-xs font-bold text-deepNavy">{title}</p>
      </div>
      {downloadEnabled && url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
        >
          <Download size={11} /> Download
        </a>
      ) : (
        <Badge tone="amber">View only</Badge>
      )}
    </div>
    {url ? (
      <iframe src={url} title={title} className="h-[520px] w-full bg-slate-100" />
    ) : (
      <div className="grid h-[240px] place-items-center bg-slate-50 text-[11px] text-slate-500">No document attached</div>
    )}
  </div>
);

export const DocumentCard = ({ title, type = 'Document', meta, icon = 'description', tone = 'blue', action, className = '' }) => {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700'
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200 ${className}`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.blue}`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-deepNavy">{title}</p>
        <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-slate-500">{type}{meta ? ` · ${meta}` : ''}</p>
      </div>
      {action}
    </div>
  );
};

export default VideoPlayer;
