CREATE TABLE `profile_image` (
	`user_id` varchar(36) PRIMARY KEY,
	`content_type` varchar(64) NOT NULL,
	`data` mediumblob NOT NULL,
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_image_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
