import { assertValidId } from '@/shared/domain/errors';
import type { CommentPreview } from '../entities/comment';
import type { CommentRepository } from '../repositories/comment-repository';

export const DEFAULT_PREVIEW_LIMIT = 2;

export type GetTopCommentPreviewsInput = {
    postIds: number[];
    limit?: number;
};

// Previews grouped by post id; posts without comments are simply absent
export type CommentPreviewsByPost = Record<number, CommentPreview[]>;

export class GetTopCommentPreviews {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ postIds, limit = DEFAULT_PREVIEW_LIMIT }: GetTopCommentPreviewsInput): Promise<CommentPreviewsByPost> {
        if (!Number.isInteger(limit) || limit < 1) throw new RangeError(`Invalid preview limit: ${limit}`);
        const ids = [...new Set(postIds)];
        for (const id of ids) assertValidId(id);
        if (ids.length === 0) return {};

        const previews = await this.comments.findTopByPostIds(ids, limit);
        const byPost: CommentPreviewsByPost = {};
        for (const preview of previews) {
            (byPost[preview.postId] ??= []).push(preview);
        }
        return byPost;
    }
}
