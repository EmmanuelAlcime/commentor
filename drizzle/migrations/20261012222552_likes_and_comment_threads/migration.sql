CREATE TABLE `comment_like` (
	`commentId` int NOT NULL,
	`userId` varchar(36) NOT NULL,
	`createdAt` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT PRIMARY KEY(`commentId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `post_like` (
	`postId` int NOT NULL,
	`userId` varchar(36) NOT NULL,
	`createdAt` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT PRIMARY KEY(`postId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `comments` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` MODIFY COLUMN `content` varchar(2000);--> statement-breakpoint
ALTER TABLE `comments` ADD `authorId` varchar(36);--> statement-breakpoint
ALTER TABLE `comments` ADD `parentId` int;--> statement-breakpoint
ALTER TABLE `comments` ADD `editedAt` timestamp(3);--> statement-breakpoint
CREATE INDEX `comments_postId_idx` ON `comments` (`postId`);--> statement-breakpoint
CREATE INDEX `comments_parentId_idx` ON `comments` (`parentId`);--> statement-breakpoint
ALTER TABLE `comment_like` ADD CONSTRAINT `comment_like_commentId_comments_id_fkey` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `comment_like` ADD CONSTRAINT `comment_like_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_authorId_user_id_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `post_like` ADD CONSTRAINT `post_like_postId_post_id_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `post_like` ADD CONSTRAINT `post_like_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE;