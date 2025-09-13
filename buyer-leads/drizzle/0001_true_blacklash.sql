PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_buyers` (
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
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_buyers`("id", "full_name", "email", "phone", "city", "property_type", "bhk", "purpose", "budget_min", "budget_max", "timeline", "source", "status", "notes", "tags", "owner_id", "updated_at") SELECT "id", "full_name", "email", "phone", "city", "property_type", "bhk", "purpose", "budget_min", "budget_max", "timeline", "source", "status", "notes", "tags", "owner_id", "updated_at" FROM `buyers`;--> statement-breakpoint
DROP TABLE `buyers`;--> statement-breakpoint
ALTER TABLE `__new_buyers` RENAME TO `buyers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;