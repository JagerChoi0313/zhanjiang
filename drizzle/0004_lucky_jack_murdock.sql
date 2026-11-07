CREATE TABLE IF NOT EXISTS `post_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`visitor_hash` varchar(64) NOT NULL,
	`visit_day` varchar(10) NOT NULL,
	CONSTRAINT `post_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_views_post_visitor_day_unique` UNIQUE(`post_id`,`visitor_hash`,`visit_day`)
);
