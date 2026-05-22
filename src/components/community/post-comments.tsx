"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createPostComment,
  deletePostComment,
  getPostComments,
} from "@/lib/supabase-service";
import type { DbPostComment } from "@/lib/supabase";
import toast from "react-hot-toast";

function commentAuthor(c: DbPostComment) {
  const p = c.user_profiles;
  if (Array.isArray(p)) return p[0]?.name || "Athlete";
  return p?.name || "Athlete";
}

function commentAvatar(c: DbPostComment) {
  const p = c.user_profiles;
  if (Array.isArray(p)) return p[0]?.avatar_url;
  return p?.avatar_url;
}

type Props = {
  postId: string;
  commentsCount: number;
  currentUserId: string;
  isAdmin?: boolean;
  onCountChange?: (count: number) => void;
};

export default function PostComments({
  postId,
  commentsCount,
  currentUserId,
  isAdmin,
  onCountChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<DbPostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(commentsCount);

  useEffect(() => {
    setDisplayCount(commentsCount);
  }, [commentsCount]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const data = await getPostComments(postId);
    setComments(data);
    setDisplayCount(data.length);
    onCountChange?.(data.length);
    setLoading(false);
  }, [postId, onCountChange]);

  useEffect(() => {
    if (open) loadComments();
  }, [open, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error("Sign in to comment");
      return;
    }
    const text = draft.trim();
    if (!text) return;

    setSubmitting(true);
    const created = await createPostComment(currentUserId, postId, text);
    setSubmitting(false);

    if (!created) {
      toast.error("Could not post comment. Run supabase/post_comments.sql if this is new.");
      return;
    }

    setDraft("");
    setComments((prev) => [...prev, created as DbPostComment]);
    const next = displayCount + 1;
    setDisplayCount(next);
    onCountChange?.(next);
    toast.success("Comment added");
  };

  const handleDelete = async (comment: DbPostComment) => {
    if (!confirm("Delete this comment?")) return;
    setDeletingId(comment.id);
    const result = await deletePostComment(currentUserId, comment.id, { isAdmin });
    setDeletingId(null);

    if (!result.ok) {
      toast.error(result.error || "Could not delete");
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    const next = Math.max(0, displayCount - 1);
    setDisplayCount(next);
    onCountChange?.(next);
  };

  const canComment = Boolean(currentUserId);

  return (
    <div className="border-t border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 sm:px-5 py-3 flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors touch-manipulation"
        aria-expanded={open}
      >
        <span className="text-xs font-bold">{displayCount} comments</span>
        <span className="text-[10px] uppercase tracking-widest text-text-muted ml-auto">
          {open ? "Hide" : "View"}
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 space-y-3">
          {loading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 text-brand animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-text-muted text-xs py-2">No comments yet. Be the first!</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto overscroll-contain pr-1">
              {comments.map((c) => {
                const canDelete = isAdmin || c.user_id === currentUserId;
                return (
                  <li
                    key={c.id}
                    className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center text-brand text-xs font-bold shrink-0 overflow-hidden">
                      {commentAvatar(c) ? (
                        <img
                          src={commentAvatar(c)!}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        commentAuthor(c)[0] || "?"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white text-xs font-bold truncate">
                          {commentAuthor(c)}
                        </p>
                        <span className="text-text-muted text-[10px] shrink-0">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mt-1 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="shrink-0 min-h-9 min-w-9 flex items-center justify-center text-red-400/80 hover:text-red-400 disabled:opacity-50 touch-manipulation"
                        aria-label="Delete comment"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {canComment ? (
            <form onSubmit={handleSubmit} className="flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                maxLength={2000}
                className="flex-1 min-h-[44px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-brand/50 placeholder:text-text-muted"
              />
              <button
                type="submit"
                disabled={submitting || !draft.trim()}
                className={cn(
                  "min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-brand text-white shrink-0 touch-manipulation",
                  "disabled:opacity-40 hover:bg-brand-dark transition-colors"
                )}
                aria-label="Post comment"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          ) : (
            <p className="text-text-muted text-xs">Sign in with Google to comment on posts.</p>
          )}
        </div>
      )}
    </div>
  );
}
