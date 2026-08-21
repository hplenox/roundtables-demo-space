"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Paperclip, AtSign, CalendarPlus, Send, Pin, ThumbsUp, MessageCircle, Download, X, CalendarCheck,
} from "lucide-react";
import { usePodCtx } from "../../pod-context";
import PodAvatar from "@/components/pods/PodAvatar";
import type { PodDiscussionPost } from "@/types/pod";

const DEMO_ATTACHMENT = { name: "Meeting Notes.pdf", sizeLabel: "240 KB" };

export default function PodDiscussionPage() {
  const { pod, postDiscussion, postPoll } = usePodCtx();
  const [body, setBody] = useState("");
  const [attaching, setAttaching] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", ""]);

  function handlePost() {
    if (!body.trim()) return;
    postDiscussion(body.trim(), attaching ? DEMO_ATTACHMENT : undefined);
    setBody("");
    setAttaching(false);
  }

  function handlePostPoll() {
    if (!pollQuestion.trim() || pollOptions.filter(Boolean).length < 2) return;
    postPoll(body.trim() || "Voting on times below — whichever wins becomes a POD event.", pollQuestion.trim(), pollOptions);
    setBody("");
    setShowPoll(false);
    setPollQuestion("");
    setPollOptions(["", "", ""]);
  }

  const pinned = pod.discussion.filter((p) => p.pinned);
  const rest = pod.discussion.filter((p) => !p.pinned);

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <p className="text-[12px] text-slate-400 mb-2">
          Posting to <span className="font-semibold text-slate-600">everyone in {pod.name}</span> · {pod.members.length} members
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share an update, ask a question, or @mention someone"
          rows={3}
          className="w-full text-[13.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none"
        />
        {attaching && (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[12px] text-slate-600 mb-2">
            <Paperclip size={12} />
            {DEMO_ATTACHMENT.name}
            <button onClick={() => setAttaching(false)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
          </div>
        )}

        {showPoll && (
          <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <input
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question, e.g. Pick a time for the walkthrough"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
            />
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => setPollOptions((prev) => prev.map((p, pi) => (pi === i ? e.target.value : p)))}
                placeholder={`Option ${i + 1}, e.g. Tue Jul 28 · 10:00 am ET`}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
              />
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowPoll(false)} className="text-[12px] font-medium text-slate-500 px-2 py-1">Cancel</button>
              <button onClick={handlePostPoll} className="text-[12px] font-semibold text-white bg-[#4361ee] hover:bg-[#3650d4] px-3 py-1.5 rounded-lg transition-colors">Post poll</button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <button onClick={() => setAttaching(true)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
              <Paperclip size={13} /> Attach
            </button>
            <button onClick={() => setBody((b) => `${b}@`)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
              <AtSign size={13} /> Mention
            </button>
            <button onClick={() => setShowPoll((s) => !s)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
              <CalendarPlus size={13} /> Propose times
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={!body.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#4361ee] text-white text-[12.5px] font-semibold hover:bg-[#3650d4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={13} /> Post
          </button>
        </div>
      </div>

      {[...pinned, ...rest].map((post) => (
        <DiscussionPost key={post.id} post={post} podId={pod.id} />
      ))}

      {pod.discussion.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-[13px] text-slate-400">No posts yet — start the conversation.</p>
        </div>
      )}
    </div>
  );
}

function DiscussionPost({ post, podId }: { post: PodDiscussionPost; podId: string }) {
  const { toggleLikePost, voteOnPoll, createEventFromPoll, addReply } = usePodCtx();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  function submitReply() {
    if (!replyText.trim()) return;
    addReply(post.id);
    setReplyText("");
    setShowReply(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <PodAvatar name={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13.5px] font-bold text-slate-900">{post.author}</p>
              {post.authorRole && (
                <span className="text-[10.5px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">{post.authorRole}</span>
              )}
              <span className="text-[11.5px] text-slate-400">{post.authorOrg}</span>
              <span className="text-[11.5px] text-slate-300">· {post.dateLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {post.pinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-semibold">
                  <Pin size={10} /> Pinned
                </span>
              )}
              {post.eventThreadTitle && (
                <Link
                  href={post.eventId ? `/pods/${podId}/events/${post.eventId}` : "#"}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-semibold hover:bg-blue-100 transition-colors"
                >
                  <CalendarCheck size={10} /> Event thread
                </Link>
              )}
            </div>
          </div>

          <p className="text-[13.5px] text-slate-700 leading-relaxed mt-1.5">{post.body}</p>

          {post.attachment && (
            <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Paperclip size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-slate-700 truncate">{post.attachment.name}</p>
                  <p className="text-[11px] text-slate-400">{post.attachment.sizeLabel}{post.attachment.alsoInFiles ? " · also in POD files" : ""}</p>
                </div>
              </div>
              <Download size={14} className="text-slate-400 shrink-0" />
            </div>
          )}

          {post.poll && <PollCard postId={post.id} poll={post.poll} onVote={(optId) => voteOnPoll(post.id, optId)} onCreateEvent={() => createEventFromPoll(post.id)} />}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => toggleLikePost(post.id)}
              className={`inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors ${post.liked ? "text-[#3650d4]" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ThumbsUp size={13} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
            </button>
            <button onClick={() => setShowReply((s) => !s)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors">
              <MessageCircle size={13} /> Reply
            </button>
            <span className="text-[12px] text-slate-300">·</span>
            <button className="text-[12px] font-medium text-slate-400 hover:text-slate-600 transition-colors">Message {post.author.split(" ")[0]}</button>
            {post.replies > 0 && <span className="ml-auto text-[12px] font-medium text-slate-400">{post.replies} repl{post.replies === 1 ? "y" : "ies"}</span>}
          </div>

          {showReply && (
            <div className="flex items-center gap-2 mt-3">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${post.author.split(" ")[0]}`}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30"
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
              />
              <button onClick={submitReply} className="text-[12px] font-semibold text-white bg-[#4361ee] hover:bg-[#3650d4] px-3 py-1.5 rounded-lg transition-colors">Send</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PollCard({
  poll, onVote, onCreateEvent,
}: {
  postId: string;
  poll: NonNullable<PodDiscussionPost["poll"]>;
  onVote: (optionId: string) => void;
  onCreateEvent: () => void;
}) {
  const best = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
  return (
    <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
        <p className="text-[12.5px] font-bold text-slate-700 flex items-center gap-1.5"><CalendarPlus size={13} className="text-[#3650d4]" /> {poll.question}</p>
        <span className="text-[11.5px] text-slate-400">{poll.votedCount} of {poll.totalVoters} voted</span>
      </div>
      <div className="divide-y divide-slate-100">
        {poll.options.map((opt) => {
          const pct = poll.totalVoters ? Math.round((opt.votes / Math.max(1, poll.options.reduce((s, o) => s + o.votes, 0))) * 100) : 0;
          const mine = poll.myVoteOptionId === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onVote(opt.id)}
              className="w-full relative flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-50/60 transition-colors"
            >
              <div className="absolute inset-y-0 left-0 bg-[#4361ee]/10" style={{ width: `${pct}%` }} />
              <span className="relative flex items-center gap-2 text-[12.5px] text-slate-700 font-medium">
                {opt.label}
                {opt.id === best.id && opt.votes > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Best time</span>
                )}
                {mine && <span className="text-[10px] font-bold text-[#3650d4]">(your vote)</span>}
              </span>
              <span className="relative text-[11.5px] text-slate-400">{opt.votes} vote{opt.votes === 1 ? "" : "s"}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white">
        {poll.createdEventId ? (
          <span className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1.5"><CalendarCheck size={13} /> Event created</span>
        ) : (
          <button onClick={onCreateEvent} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#4361ee] hover:bg-[#3650d4] px-3 py-1.5 rounded-lg transition-colors">
            <CalendarPlus size={13} /> Create event · {best?.label.split("·")[1]?.trim() ?? best?.label}
          </button>
        )}
      </div>
    </div>
  );
}
