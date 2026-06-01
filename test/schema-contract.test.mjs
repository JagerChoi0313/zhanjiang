import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";

const exportSchemaSql = () => execFileSync(
  "pnpm",
  ["exec", "drizzle-kit", "export", "--config", "drizzle.config.js"],
  { cwd: process.cwd(), encoding: "utf8" },
);

test("drizzle export uses int auto increment primary keys instead of serial", () => {
  const sql = exportSchemaSql();

  assert.doesNotMatch(sql, /\bserial\s+AUTO_INCREMENT\b/i);
  assert.match(sql, /`users`[\s\S]*`user_id`\s+int\s+AUTO_INCREMENT\s+NOT NULL/i);
  assert.match(sql, /`posts`[\s\S]*`id`\s+int\s+AUTO_INCREMENT\s+NOT NULL/i);
});

test("drizzle export contains schema constraints recovered from backup", () => {
  const sql = exportSchemaSql();

  assert.match(sql, /`posts`[\s\S]*`images`\s+json/i);
  assert.match(sql, /`hot_recommend`[\s\S]*`comments`\s+int\s+DEFAULT 0/i);
  assert.match(sql, /CONSTRAINT\s+`explore_spots_area_slug_unique`\s+UNIQUE\(`area_slug`\)/i);
  assert.match(sql, /CONSTRAINT\s+`favorites_user_post_unique`\s+UNIQUE\(`user_id`,`post_id`\)/i);
  assert.match(sql, /CONSTRAINT\s+`follows_follower_following_unique`\s+UNIQUE\(`follower_id`,`following_id`\)/i);
});

test("drizzle schema and export do not declare database foreign keys", () => {
  const sql = exportSchemaSql();
  const schema = readFileSync("database/schema.js", "utf8");

  assert.doesNotMatch(schema, /\.references\(/);
  assert.doesNotMatch(sql, /FOREIGN KEY/i);
  assert.doesNotMatch(sql, /\bREFERENCES\s+[`"\w]/i);
  assert.doesNotMatch(sql, /ON DELETE cascade/i);
});

test("drizzle export contains indexes for common query paths", () => {
  const sql = exportSchemaSql();

  assert.match(sql, /CREATE INDEX `posts_created_at_idx` ON `posts` \(`create_at`\)/i);
  assert.match(sql, /CREATE INDEX `posts_user_created_at_idx` ON `posts` \(`user_id`,`create_at`\)/i);
  assert.match(sql, /CREATE INDEX `posts_status_created_at_idx` ON `posts` \(`status`,`create_at`\)/i);
  assert.match(sql, /CREATE INDEX `comments_post_created_at_idx` ON `comments` \(`post_id`,`created_at`\)/i);
  assert.match(sql, /CREATE INDEX `comments_user_created_at_idx` ON `comments` \(`user_id`,`created_at`\)/i);
  assert.match(sql, /CREATE INDEX `comments_status_created_at_idx` ON `comments` \(`status`,`created_at`\)/i);
  assert.match(sql, /CREATE INDEX `users_role_status_idx` ON `users` \(`user_role`,`user_status`\)/i);
  assert.match(sql, /CREATE INDEX `favorites_user_created_at_idx` ON `favorites` \(`user_id`,`created_at`\)/i);
  assert.match(sql, /CREATE INDEX `favorites_post_idx` ON `favorites` \(`post_id`\)/i);
  assert.match(sql, /CREATE INDEX `follows_following_idx` ON `follows` \(`following_id`\)/i);
  assert.match(sql, /CREATE INDEX `explore_carousel_spot_sort_idx` ON `explore_carousel` \(`spot_id`,`sort_order`\)/i);
  assert.match(sql, /CREATE INDEX `hot_recommend_rank_score_idx` ON `hot_recommend` \(`rank_score`\)/i);
  assert.match(sql, /CREATE INDEX `hot_topics_rank_idx` ON `hot_topics` \(`rank`\)/i);
  assert.match(sql, /CREATE INDEX `talk_ranking_created_at_idx` ON `talk_ranking` \(`create_at`\)/i);
  assert.match(sql, /CREATE INDEX `talk_ranking_user_avatar_idx` ON `talk_ranking` \(`user_name`,`avatar`\)/i);
});

test("drizzle export contains admin role and content status fields", () => {
  const sql = exportSchemaSql();

  assert.match(sql, /`users`[\s\S]*`user_role`\s+varchar\(20\)\s+NOT NULL\s+DEFAULT 'user'/i);
  assert.match(sql, /`users`[\s\S]*`user_status`\s+varchar\(20\)\s+NOT NULL\s+DEFAULT 'active'/i);
  assert.match(sql, /`posts`[\s\S]*`status`\s+tinyint unsigned\s+NOT NULL\s+DEFAULT 1/i);
  assert.match(sql, /`comments`[\s\S]*`status`\s+tinyint unsigned\s+NOT NULL\s+DEFAULT 1/i);
  assert.doesNotMatch(sql, /`is_deleted`|`deleted_at`|`deleted_by`/i);
});

test("drizzle export contains upload asset governance tables without foreign keys", () => {
  const sql = exportSchemaSql();

  assert.match(sql, /CREATE TABLE `upload_assets`/i);
  assert.match(sql, /`content_hash`\s+varchar\(64\)\s+NOT NULL/i);
  assert.match(sql, /CONSTRAINT\s+`upload_assets_content_hash_unique`\s+UNIQUE\(`content_hash`\)/i);
  assert.match(sql, /CREATE TABLE `upload_claims`/i);
  assert.match(sql, /CREATE INDEX `upload_claims_user_status_idx` ON `upload_claims` \(`user_id`,`status`,`expires_at`\)/i);
  assert.match(sql, /CREATE TABLE `upload_references`/i);
  assert.match(sql, /CONSTRAINT\s+`upload_references_entity_asset_unique`\s+UNIQUE\(`entity_type`,`entity_id`,`asset_id`\)/i);
  assert.doesNotMatch(sql, /upload_assets[\s\S]*FOREIGN KEY/i);
}
);

test("database scripts do not initialize from full backup dumps", () => {
  const packageJson = readFileSync("package.json", "utf8");

  assert.doesNotMatch(packageJson, /db_backup\/.+\.sql/);
});
