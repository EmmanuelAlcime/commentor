export interface PostLikeRepository {
    countByPostId(postId: number): Promise<number>;
    isLikedBy(postId: number, userId: string): Promise<boolean>;
    // Both are idempotent: liking twice keeps one like, unliking without a like does nothing
    add(postId: number, userId: string): Promise<void>;
    remove(postId: number, userId: string): Promise<void>;
}
