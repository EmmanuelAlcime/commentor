import { assertValidId } from '@/shared/domain/errors';
import type { CommentSort } from '../entities/comment';
import { buildCommentTree, type CommentNode } from '../entities/comment-tree';
import type { CommentRepository } from '../repositories/comment-repository';

export type GetPostCommentsInput = {
    postId: number;
    // Signed-in user, so each comment can say whether they liked it; null when signed out
    viewerId: string | null;
    sort: CommentSort;
};

export class GetPostComments {
    constructor(private readonly comments: CommentRepository) {}

    async execute({ postId, viewerId, sort }: GetPostCommentsInput): Promise<CommentNode[]> {
        assertValidId(postId);
        const views = await this.comments.findViewsByPostId(postId, viewerId);
        return buildCommentTree(views, sort);
    }
}
