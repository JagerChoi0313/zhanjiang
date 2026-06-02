CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`user_id` int NOT NULL,
	`post_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `explore_carousel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spot_id` int NOT NULL,
	`img_url` varchar(500) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500),
	`sort_order` int DEFAULT 0,
	CONSTRAINT `explore_carousel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `explore_spots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`area_slug` varchar(50) NOT NULL,
	`area_name` varchar(100) NOT NULL,
	`dot_left` float NOT NULL,
	`dot_top` float NOT NULL,
	`card_left` float NOT NULL,
	`card_top` float NOT NULL,
	`svg_path` varchar(500),
	`create_at` timestamp DEFAULT (now()),
	CONSTRAINT `explore_spots_id` PRIMARY KEY(`id`),
	CONSTRAINT `explore_spots_area_slug_unique` UNIQUE(`area_slug`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`post_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `favorites_user_post_unique` UNIQUE(`user_id`,`post_id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`follower_id` int NOT NULL,
	`following_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `follows_follower_following_unique` UNIQUE(`follower_id`,`following_id`)
);
--> statement-breakpoint
CREATE TABLE `hot_recommend` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`cover_image` varchar(500),
	`views` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`rank_score` int DEFAULT 0,
	`district` varchar(100),
	`slogan` varchar(255),
	`category` varchar(100) DEFAULT '全部',
	`create_at` timestamp DEFAULT (now()),
	CONSTRAINT `hot_recommend_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talk_ranking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`comment` varchar(500) NOT NULL,
	`avatar` varchar(500),
	`rating` int DEFAULT 5,
	`create_at` timestamp DEFAULT (now()),
	CONSTRAINT `talk_ranking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taste_card` (
	`id` varchar(10) NOT NULL,
	`name` varchar(255) NOT NULL,
	`en_name` varchar(100),
	`desc` text,
	`bg_color` varchar(7),
	`image_path` varchar(255) DEFAULT '/images/food/default.png',
	`tags` json,
	`origin` varchar(100),
	`season` varchar(100),
	`main_methods` varchar(255),
	`taste_profile` varchar(255),
	`features` json,
	`nutrition` json,
	`culture` json,
	`recipes` json,
	CONSTRAINT `taste_card_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(255) NOT NULL,
	`avatar` text,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phoneNumber` varchar(20),
	`gender` varchar(10),
	`age` tinyint unsigned,
	`createAt` timestamp DEFAULT (now()),
	`introduction` text,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `hot_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`view_court` varchar(50) DEFAULT 0,
	`rank` int,
	`ishot` boolean DEFAULT false,
	`create_at` timestamp DEFAULT (now()),
	CONSTRAINT `hot_topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`excerpt` varchar(500),
	`cover_image` text,
	`images` json,
	`category` varchar(50),
	`location` varchar(100),
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`is_hot` boolean DEFAULT false,
	`create_at` timestamp DEFAULT (now()),
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `comments_post_created_at_idx` ON `comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `comments_user_created_at_idx` ON `comments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `explore_carousel_spot_sort_idx` ON `explore_carousel` (`spot_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `favorites_user_created_at_idx` ON `favorites` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `follows_following_idx` ON `follows` (`following_id`);--> statement-breakpoint
CREATE INDEX `posts_created_at_idx` ON `posts` (`create_at`);--> statement-breakpoint
CREATE INDEX `posts_user_created_at_idx` ON `posts` (`user_id`,`create_at`);