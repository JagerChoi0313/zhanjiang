ALTER TABLE `comments` ADD `status` tinyint unsigned DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `user_role` varchar(20) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `user_status` varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `status` tinyint unsigned DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `comments_status_created_at_idx` ON `comments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `users_role_status_idx` ON `users` (`user_role`,`user_status`);--> statement-breakpoint
CREATE INDEX `posts_status_created_at_idx` ON `posts` (`status`,`create_at`);