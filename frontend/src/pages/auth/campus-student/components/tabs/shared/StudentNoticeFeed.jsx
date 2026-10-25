import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Heart, MessageCircle, Pin, Search, Send } from 'lucide-react';
import { Avatar, SearchInput } from '@/components/ui/Primitives';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MOCK_NOTICE_COMMENTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const TONE_BY_ROLE = {
  COE: 'blue',
  Library: 'teal',
  TPO: 'violet',
  Admin: 'amber',
  Faculty: 'indigo',
  Student: 'slate'
};

const AVATAR_TONE = {
  COE: 'blue',
  Library: 'teal',
  TPO: 'violet',
  Admin: 'amber',
  Faculty: 'indigo',
  Student: 'slate'
};

export const NoticeFeed = ({ notices = [], tone = 'indigo', triggerPopup, studentName = 'Aarav Sharma', commenterRole = 'Student' }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [likes, setLikes] = useState({});
  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState(() => {
    const seed = {};
    notices.forEach((notice) => {
      seed[notice.id] = (MOCK_NOTICE_COMMENTS[notice.id] || []).map((comment) => ({ ...comment }));
    });
    return seed;
  });

  const categories = useMemo(() => ['All', ...Array.from(new Set(notices.map((notice) => notice.category)))], [notices]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return notices
      .filter((notice) => {
        const matchesQuery = !value || notice.title.toLowerCase().includes(value) || notice.content.toLowerCase().includes(value);
        return matchesQuery && (category === 'All' || notice.category === category);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notices, query, category]);

  const react = (notice) => {
    setLikes((prev) => {
      const next = { ...prev, [notice.id]: !prev[notice.id] };
      triggerPopup?.(
        next[notice.id] ? `You reacted to “${notice.title}”.` : `Reaction removed from “${notice.title}”.`,
        'info'
      );
      return next;
    });
  };

  const post = () => {
    const value = draft.trim();
    if (!value || !active) return;
    setThreads((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] || []),
        {
          id: `local-${Date.now()}`,
          user: studentName,
          role: commenterRole,
          text: value,
          date: new Date().toISOString(),
          replies: []
        }
      ]
    }));
    setDraft('');
    triggerPopup?.('Comment posted to this notice.', 'success');
  };

  const commentCount = (notice) => notice.comments + Math.max(0, (threads[notice.id]?.length || 0) - (MOCK_NOTICE_COMMENTS[notice.id]?.length || 0));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search notices…" className="w-full sm:max-w-xs" tone={tone} />
        <div className="flex flex-wrap items-center gap-1">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-lg px-2 py-1 text-[9.5px] font-bold transition-colors ${
                category === item
                  ? tone === 'orange'
                    ? 'bg-orange-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.map((notice) => {
          const liked = Boolean(likes[notice.id]);
          return (
            <article key={notice.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="p-3.5 sm:p-4">
                <div className="flex items-start gap-2.5">
                  <Avatar name={notice.poster} size="sm" tone={AVATAR_TONE[notice.posterRole] || 'indigo'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[10.5px] font-bold text-deepNavy">{notice.poster}</p>
                      <span className="text-[8.5px] font-semibold text-slate-500">· {notice.posterRole}</span>
                      {notice.pinned ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                          <Pin size={8} /> Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">
                      {notice.department} · {format(new Date(notice.date), 'd MMM yyyy, h:mm a')}
                    </p>
                  </div>
                  <Badge tone={TONE_BY_ROLE[notice.posterRole] || 'slate'}>{notice.category}</Badge>
                </div>

                <h3 className="mt-2.5 text-[12.5px] font-extrabold leading-snug text-deepNavy font-jost sm:text-[13px]">{notice.title}</h3>
                <p className="mt-1 line-clamp-3 text-[10.5px] leading-relaxed text-slate-600">{notice.content}</p>

                <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
                  <button
                    onClick={() => react(notice)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9.5px] font-bold transition-colors ${
                      liked ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Heart size={12} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
                    {notice.reactions + (liked ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => {
                      setActive(notice);
                      setDraft('');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9.5px] font-bold text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    <MessageCircle size={12} />
                    {commentCount(notice)} comments
                  </button>
                  <span className="ml-auto hidden text-[8.5px] font-semibold text-slate-500 sm:block">{notice.type === 'staff' ? 'Campus-wide' : 'Department only'}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
          <Search size={20} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-deepNavy font-jost">No notices match this filter</p>
          <p className="mt-1 text-xs text-slate-500">Try another category or clear the search.</p>
        </div>
      ) : null}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active?.title || 'Notice discussion'}
        description={active ? `${active.department} · ${active.poster}` : undefined}
        size="md"
        footer={
          <div className="flex w-full items-center gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') post();
              }}
              placeholder="Write a comment…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-deepNavy placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <Button size="sm" icon={Send} onClick={post} disabled={!draft.trim()}>
              Post
            </Button>
          </div>
        }
      >
        {active ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10.5px] leading-relaxed text-slate-600">{active.content}</p>
            </div>
            <div className="space-y-3">
              {(threads[active.id] || []).map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-start gap-2">
                    <Avatar name={comment.user} size="xs" tone={AVATAR_TONE[comment.role] || 'slate'} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-bold text-deepNavy">{comment.user}</p>
                        <Badge tone={TONE_BY_ROLE[comment.role] || 'slate'}>{comment.role}</Badge>
                      </div>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">{comment.text}</p>
                      <p className="mt-0.5 text-[8px] font-semibold text-slate-500">{format(new Date(comment.date), 'd MMM, h:mm a')}</p>
                    </div>
                  </div>
                  {comment.replies?.map((reply) => (
                    <div key={reply.id} className="ml-9 mt-2 flex items-start gap-2 rounded-xl bg-slate-50 p-2.5">
                      <Avatar name={reply.user} size="xs" tone={AVATAR_TONE[reply.role] || 'indigo'} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[9.5px] font-bold text-deepNavy">{reply.user}</p>
                          <Badge tone={TONE_BY_ROLE[reply.role] || 'slate'}>{reply.role}</Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {!(threads[active.id] || []).length ? (
                <p className="py-4 text-center text-[10.5px] font-semibold text-slate-500">No comments yet. Start the discussion.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default NoticeFeed;
