import { useRef, useState } from 'react';
import { FileUp, X } from 'lucide-react';

export const FileDropzone = ({
  onFiles,
  accept = '.pdf,.docx,.xlsx,.pptx,.txt,image/*',
  multiple = false,
  maxSizeMb = 25,
  label = 'Drop a file here or browse',
  hint = 'PDF, DOCX, XLSX, PPTX, images · up to 25 MB',
  className = '',
  tone = 'violet'
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const tones = {
    violet: 'border-violet-200 bg-violet-50/40 hover:bg-violet-50',
    blue: 'border-blue-200 bg-blue-50/40 hover:bg-blue-50',
    teal: 'border-teal-200 bg-teal-50/40 hover:bg-teal-50',
    indigo: 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50'
  };

  const handle = (fileList) => {
    const next = Array.from(fileList || []).filter((file) => file.size <= maxSizeMb * 1024 * 1024);
    if (!next.length) return;
    const merged = multiple ? [...files, ...next] : next.slice(0, 1);
    setFiles(merged);
    onFiles?.(merged);
  };

  return (
    <div className={className}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handle(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? 'border-violet-400 bg-violet-50' : tones[tone] || tones.violet
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-violet-600 shadow-2xs">
          <FileUp size={17} />
        </span>
        <div>
          <p className="text-[11px] font-bold text-deepNavy">{label}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => handle(event.target.files)}
        />
      </div>
      {files.length ? (
        <div className="mt-2 space-y-1.5">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-1.5">
              <span className="material-symbols-outlined text-[15px] text-slate-400">draft</span>
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-600">{file.name}</span>
              <span className="text-[9px] text-slate-500 tabular">{(file.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => {
                  const next = files.filter((_, i) => i !== index);
                  setFiles(next);
                  onFiles?.(next);
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Remove ${file.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FileDropzone;
