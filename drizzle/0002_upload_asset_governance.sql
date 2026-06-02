CREATE TABLE `upload_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_hash` varchar(64) NOT NULL,
	`public_url` varchar(255) NOT NULL,
	`mime_type` varchar(50) NOT NULL,
	`extension` varchar(10) NOT NULL,
	`size` int unsigned NOT NULL,
	`width` int unsigned NOT NULL,
	`height` int unsigned NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`delete_after` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `upload_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `upload_assets_content_hash_unique` UNIQUE(`content_hash`),
	CONSTRAINT `upload_assets_public_url_unique` UNIQUE(`public_url`)
);
--> statement-breakpoint
CREATE TABLE `upload_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_id` int NOT NULL,
	`user_id` int NOT NULL,
	`purpose` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'temporary',
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `upload_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `upload_references` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_id` int NOT NULL,
	`user_id` int NOT NULL,
	`entity_type` varchar(30) NOT NULL,
	`entity_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `upload_references_id` PRIMARY KEY(`id`),
	CONSTRAINT `upload_references_entity_asset_unique` UNIQUE(`entity_type`,`entity_id`,`asset_id`)
);
--> statement-breakpoint
CREATE INDEX `upload_assets_status_delete_idx` ON `upload_assets` (`status`,`delete_after`);--> statement-breakpoint
CREATE INDEX `upload_claims_user_status_idx` ON `upload_claims` (`user_id`,`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `upload_claims_asset_status_idx` ON `upload_claims` (`asset_id`,`status`);--> statement-breakpoint
CREATE INDEX `upload_references_asset_idx` ON `upload_references` (`asset_id`);--> statement-breakpoint
CREATE INDEX `upload_references_user_idx` ON `upload_references` (`user_id`);