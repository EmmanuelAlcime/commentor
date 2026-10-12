"use client";

import { useState, useTransition } from "react";
import { isCommentAuthor } from "@/features/comments/domain/entities/comment";
import type { CommentNode } from "@/features/comments/domain/entities/comment-tree";
import { formatRelativeTime } from "@/shared/presentation/format-relative-time";
import { LikeButton } from "@/shared/presentation/components/LikeButton";
import { LoginLink } from "@/shared/presentation/components/LoginLink";
import { Avatar } from "@/shared/presentation/components/ui/Avatar";
import { Icon } from "@/shared/presentation/components/ui/Icon";
import {
    deleteCommentAction,
    editCommentAction,
    replyToCommentAction,
    setCommentLikeAction,
} from "../actions/comment-actions";
import { CommentForm } from "./CommentForm";

// Replies indent until this depth, then line up with their parent so deep threads still fit on a phone
const MAX_INDENT_DEPTH = 4;

const actionButton =
    "rounded-full px-2 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-100";
const dangerButton =
    "rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60";

const repliesLabel = (count: number) => `${count} ${count === 1 ? "reply" : "replies"}`;

type Mode = "view" | "reply" | "edit" | "confirm-delete";

type Props = {
    node: CommentNode;
    viewerId: string | null;
    depth: number;
    parentAuthorName?: string;
};

export function CommentThread({ node, viewerId, depth, parentAuthorName }: Props) {
    const [mode, setMode] = useState<Mode>("view");
    const [showReplies, setShowReplies] = useState(false);
    const isAuthor = viewerId !== null && isCommentAuthor(node, viewerId);
    const isReply = depth > 0;

    return (
        <li>
            <article aria-label={`Comment by ${node.authorName}`} className="flex gap-3">
                <Avatar name={node.authorName} src={node.authorImage} className={isReply ? "size-8 text-xs" : "size-10 text-sm"} />
                <div className="min-w-0 flex-1">
                    <header className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{node.authorName}</span>
                        {node.createdAt && (
                            <>
                                <span aria-hidden="true" className="text-zinc-400">·</span>
                                {/* Relative time can differ by a minute between server and browser */}
                                <time
                                    dateTime={node.createdAt.toISOString()}
                                    title={node.createdAt.toLocaleString()}
                                    suppressHydrationWarning
                                    className="text-zinc-500 dark:text-zinc-400"
                                >
                                    {formatRelativeTime(node.createdAt)}
                                </time>
                            </>
                        )}
                        {node.editedAt && <span className="text-zinc-500 dark:text-zinc-400">· Edited</span>}
                    </header>
                    {depth > MAX_INDENT_DEPTH && parentAuthorName && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Replying to {parentAuthorName}</p>
                    )}

                    {mode === "edit" ? (
                        <div className="mt-2">
                            <CommentForm
                                action={editCommentAction.bind(null, node.id)}
                                label="Edit your comment"
                                placeholder="Edit your comment…"
                                submitLabel="Save"
                                pendingLabel="Saving…"
                                defaultValue={node.content ?? ""}
                                autoFocus
                                onCancel={() => setMode("view")}
                                onSuccess={() => setMode("view")}
                            />
                        </div>
                    ) : (
                        <p className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-6 text-zinc-800 dark:text-zinc-200">
                            {node.content}
                        </p>
                    )}

                    <div className="-ml-2 mt-1 flex flex-wrap items-center gap-1">
                        <LikeButton
                            size="sm"
                            count={node.likeCount}
                            liked={node.likedByViewer}
                            signedIn={viewerId !== null}
                            action={setCommentLikeAction.bind(null, node.id)}
                            subject={`${node.authorName}'s comment`}
                        />
                        {viewerId ? (
                            <button type="button" onClick={() => setMode("reply")} className={actionButton}>
                                Reply
                            </button>
                        ) : (
                            <LoginLink className={actionButton} label="Log in to reply">
                                Reply
                            </LoginLink>
                        )}
                        {isAuthor && mode !== "edit" && (
                            <>
                                <button type="button" onClick={() => setMode("edit")} className={actionButton}>
                                    Edit
                                </button>
                                <button type="button" onClick={() => setMode("confirm-delete")} className={actionButton}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>

                    {mode === "confirm-delete" && (
                        <DeleteConfirmation node={node} onCancel={() => setMode("view")} />
                    )}

                    {mode === "reply" && (
                        <div className="mt-2">
                            <CommentForm
                                action={replyToCommentAction.bind(null, node.id)}
                                label={`Reply to ${node.authorName}`}
                                placeholder={`Reply to ${node.authorName}…`}
                                submitLabel="Reply"
                                pendingLabel="Replying…"
                                autoFocus
                                onCancel={() => setMode("view")}
                                onSuccess={() => {
                                    setMode("view");
                                    setShowReplies(true);
                                }}
                            />
                        </div>
                    )}

                    {node.replyCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowReplies((shown) => !shown)}
                            aria-expanded={showReplies}
                            className="-ml-2 mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
                        >
                            <Icon name="chevron-down" className={`size-4 transition ${showReplies ? "rotate-180" : ""}`} />
                            {showReplies ? "Hide replies" : `View ${repliesLabel(node.replyCount)}`}
                        </button>
                    )}

                    {showReplies && node.replies.length > 0 && (
                        <ol className={`mt-3 space-y-4 ${depth + 1 > MAX_INDENT_DEPTH ? "-ml-11" : ""}`}>
                            {node.replies.map((reply) => (
                                <CommentThread
                                    key={reply.id}
                                    node={reply}
                                    viewerId={viewerId}
                                    depth={depth + 1}
                                    parentAuthorName={node.authorName}
                                />
                            ))}
                        </ol>
                    )}
                </div>
            </article>
        </li>
    );
}

function DeleteConfirmation({ node, onCancel }: { node: CommentNode; onCancel: () => void }) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const confirm = () => {
        setError(null);
        startTransition(async () => {
            const result = await deleteCommentAction(node.id);
            if (!result.ok) setError(result.error);
        });
    };

    return (
        <div role="alertdialog" aria-label="Delete comment" className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">
                {node.replyCount > 0
                    ? `Delete this comment and its ${repliesLabel(node.replyCount)}? This can't be undone.`
                    : "Delete this comment? This can't be undone."}
            </p>
            {error && (
                <p role="alert" className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">
                    {error}
                </p>
            )}
            <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={onCancel} disabled={pending} className={actionButton}>
                    Cancel
                </button>
                <button type="button" onClick={confirm} disabled={pending} autoFocus className={dangerButton}>
                    {pending ? "Deleting…" : "Delete"}
                </button>
            </div>
        </div>
    );
}
