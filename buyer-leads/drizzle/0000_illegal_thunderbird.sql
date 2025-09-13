CREATE TABLE `buyer_history` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_id` text NOT NULL,
	`changed_by` text NOT NULL,
	`changed_at` integer,
	`diff` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `buyers` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`property_type` text NOT NULL,
	`bhk` text,
	`purpose` text NOT NULL,
	`budget_min` integer,
	`budget_max` integer,
	`timeline` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'New',
	`notes` text,
	`tags` text,
	`owner_id` text NOT NULL,
	`updated_at` integer
);
