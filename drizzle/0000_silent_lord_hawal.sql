CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`booking_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit` (`user_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`venue_id` text NOT NULL,
	`unit` text NOT NULL,
	`date` text NOT NULL,
	`hour` integer NOT NULL,
	`price` integer NOT NULL,
	`paid` integer NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `booking_user_idx` ON `bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `booking_venue_idx` ON `bookings` (`venue_id`);--> statement-breakpoint
CREATE TABLE `slot_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`unit` text NOT NULL,
	`date` text NOT NULL,
	`hour` integer NOT NULL,
	`user_id` text NOT NULL,
	`hold_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_venue_slot` ON `slot_claims` (`venue_id`,`unit`,`date`,`hour`);--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`venue_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `favorite_user_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE TABLE `merchants` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merchant_owner_idx` ON `merchants` (`user_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`booking_id` text NOT NULL,
	`venue_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_booking_idx` ON `reviews` (`booking_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
