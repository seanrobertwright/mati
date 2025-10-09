CREATE TABLE "directory_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"directory_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"granted_by" uuid NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directory_permissions" ADD CONSTRAINT "directory_permissions_directory_id_directories_id_fk" FOREIGN KEY ("directory_id") REFERENCES "public"."directories"("id") ON DELETE cascade ON UPDATE no action;