CREATE TABLE `conversion_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visit_id` text NOT NULL,
	`event` text NOT NULL,
	`placement` text NOT NULL,
	`source` text DEFAULT 'direct' NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_events_visit_event_placement` ON `conversion_events` (`visit_id`,`event`,`placement`);--> statement-breakpoint
CREATE INDEX `idx_events_created_at` ON `conversion_events` (`created_at`);--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `timing` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `source` text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `campaign` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `visit_id` text;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `stage` text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `notification_state` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `notification_at` text;--> statement-breakpoint
ALTER TABLE `introduction_requests` ADD `notification_id` text;