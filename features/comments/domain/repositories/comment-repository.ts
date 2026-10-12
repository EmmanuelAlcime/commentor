import type { Comment } from '../entities/comment';

export interface CommentRepository {
    findById(id: number): Promise<Comment | null>;
    findByPostId(postId: number): Promise<Comment[]>;
    findByUserId(userId: number): Promise<Comment[]>;
}
