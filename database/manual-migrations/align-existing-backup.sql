-- Align a database restored from db_backup/zhangjiang_db_full_backup.sql
-- with the Drizzle schema in database/schema.js.
--
-- This is a one-time structural migration for existing restored databases.
-- New environments should use drizzle migrations instead of importing the full backup.

ALTER TABLE `comments` DROP FOREIGN KEY `fk_comment_post`;
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comment_user`;
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_post_id`;
ALTER TABLE `comments` DROP FOREIGN KEY `fk_comments_user_id`;

ALTER TABLE `posts` DROP FOREIGN KEY `fk_posts_user_id`;
ALTER TABLE `posts` DROP FOREIGN KEY `fk_posts_users`;
ALTER TABLE `posts`
  MODIFY `user_id` int NOT NULL,
  MODIFY `images` json DEFAULT NULL;

ALTER TABLE `explore_carousel` DROP FOREIGN KEY `fk_spot`;

ALTER TABLE `favorites` DROP FOREIGN KEY `fk_favorites_post_id`;
ALTER TABLE `favorites` DROP FOREIGN KEY `fk_favorites_user_id`;
ALTER TABLE `favorites` RENAME INDEX `unqiue_user_post` TO `favorites_user_post_unique`;

ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_1`;
ALTER TABLE `follows` DROP FOREIGN KEY `follows_ibfk_2`;
ALTER TABLE `follows` RENAME INDEX `unique_follow` TO `follows_follower_following_unique`;

ALTER TABLE `explore_spots` RENAME INDEX `area_slug` TO `explore_spots_area_slug_unique`;

ALTER TABLE `users` DROP INDEX `phoneNumber`;
ALTER TABLE `users`
  MODIFY `phoneNumber` varchar(20) DEFAULT NULL,
  MODIFY `gender` varchar(10) DEFAULT NULL,
  MODIFY `age` tinyint unsigned DEFAULT NULL;

CREATE INDEX `comments_post_created_at_idx` ON `comments` (`post_id`, `created_at`);
CREATE INDEX `comments_user_created_at_idx` ON `comments` (`user_id`, `created_at`);
CREATE INDEX `explore_carousel_spot_sort_idx` ON `explore_carousel` (`spot_id`, `sort_order`);
CREATE INDEX `favorites_user_created_at_idx` ON `favorites` (`user_id`, `created_at`);
CREATE INDEX `follows_following_idx` ON `follows` (`following_id`);
CREATE INDEX `posts_created_at_idx` ON `posts` (`create_at`);
CREATE INDEX `posts_user_created_at_idx` ON `posts` (`user_id`, `create_at`);
