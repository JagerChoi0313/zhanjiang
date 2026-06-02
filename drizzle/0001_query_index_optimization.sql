CREATE INDEX `favorites_post_idx` ON `favorites` (`post_id`);--> statement-breakpoint
CREATE INDEX `hot_recommend_rank_score_idx` ON `hot_recommend` (`rank_score`);--> statement-breakpoint
CREATE INDEX `talk_ranking_created_at_idx` ON `talk_ranking` (`create_at`);--> statement-breakpoint
CREATE INDEX `talk_ranking_user_avatar_idx` ON `talk_ranking` (`user_name`,`avatar`);--> statement-breakpoint
CREATE INDEX `hot_topics_rank_idx` ON `hot_topics` (`rank`);