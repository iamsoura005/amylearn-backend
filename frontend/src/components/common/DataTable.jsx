import { useMemo, useState } from 'react';

export const DataTable = ({
  columns = [],
  rows = [],
  keyField = 'id',
  empty = null,
  dense = false,
  className = '',
  onRowClick,
  footer,
  maxHeight
}) => {
  const [sort, setSort] = useState(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { key, dir } = sort;
    return [...rows].sort((a, b) => {
      const av = a?.[key] ?? '';
      const bv = b?.[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return dir === 'asc' ? av - bv : bv - av;
      return dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sort]);

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
      <div className="overflow-x-auto" style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (col.sortable === false) return;
                    setSort((prev) =>
                      prev?.key === col.key ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key: col.key, dir: 'asc' }
                    );
                  }}
                  className={`whitespace-nowrap border-b border-slate-100 px-4 text-[10px] font-bold uppercase tracking-wide text-slate-500 ${
                    dense ? 'py-2' : 'py-3'
                  } ${col.sortable === false ? '' : 'cursor-pointer select-none hover:text-deepNavy'} ${col.className || ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sort?.key === col.key ? (
                      <span className="material-symbols-outlined text-[13px]">
                        {sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-500">
                  {empty || 'No records yet.'}
                </td>
              </tr>
            ) : (
              sorted.map((row, rowIndex) => (
                <tr
                  key={row[keyField] ?? rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-slate-50 transition-colors last:border-0 hover:bg-blue-50/30 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 align-middle text-xs text-slate-700 ${dense ? 'py-2' : 'py-3'} ${
                        col.tdClassName || ''
                      }`}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500">{footer}</div> : null}
    </div>
  );
};

export default DataTable;
