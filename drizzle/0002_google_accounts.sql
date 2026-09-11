CREATE TABLE `oauth_accounts` (
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`provider`, `provider_user_id`)
);
--> statement-breakpoint
CREATE INDEX `oauth_account_user_idx` ON `oauth_accounts` (`user_id`);
