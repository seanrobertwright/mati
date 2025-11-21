CREATE TABLE "capa_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capa_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"assigned_to" uuid NOT NULL,
	"due_date" timestamp,
	"priority" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"effectiveness_criteria" text
);
--> statement-breakpoint
CREATE TABLE "capa_effectiveness_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capa_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"review_date" timestamp DEFAULT now() NOT NULL,
	"findings" text NOT NULL,
	"recommendations" text,
	"next_review_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capa_investigations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capa_id" uuid NOT NULL,
	"investigator_id" uuid NOT NULL,
	"methodology" text NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"target_completion_date" timestamp,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"completed_at" timestamp,
	"findings_summary" text
);
--> statement-breakpoint
CREATE TABLE "capa_root_causes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigation_id" uuid NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"evidence" text,
	"confidence_level" integer NOT NULL,
	"tool_used" text,
	"tool_data" text
);
--> statement-breakpoint
CREATE TABLE "capa_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"capa_id" uuid NOT NULL,
	"action_id" uuid,
	"method" text NOT NULL,
	"criteria" text NOT NULL,
	"results" text NOT NULL,
	"verified_by" uuid NOT NULL,
	"verification_date" timestamp DEFAULT now() NOT NULL,
	"next_review_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "capas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"priority" text NOT NULL,
	"severity" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_step" text DEFAULT 'identification' NOT NULL,
	"initiated_by" uuid NOT NULL,
	"initiated_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"closed_at" timestamp,
	"category" text,
	"department" text,
	"affected_areas" text,
	CONSTRAINT "capas_number_unique" UNIQUE("number")
);
--> statement-breakpoint
ALTER TABLE "change_requests" DROP CONSTRAINT "change_requests_document_id_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "change_requests" ALTER COLUMN "requested_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "capa_required" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "capa_id" uuid;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "capa_initiated_at" timestamp;--> statement-breakpoint
ALTER TABLE "incidents" ADD COLUMN "capa_status" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "document_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "document_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "revision" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "request_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "department" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "change_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "reason" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "impact_assessment" text NOT NULL;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "affected_documents" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "proposed_by" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "implementation_date" timestamp;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "training_required" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "retraining_required" text;--> statement-breakpoint
ALTER TABLE "change_requests" ADD COLUMN "additional_notes" text;--> statement-breakpoint
ALTER TABLE "capa_actions" ADD CONSTRAINT "capa_actions_capa_id_capas_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa_effectiveness_reviews" ADD CONSTRAINT "capa_effectiveness_reviews_capa_id_capas_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa_investigations" ADD CONSTRAINT "capa_investigations_capa_id_capas_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa_root_causes" ADD CONSTRAINT "capa_root_causes_investigation_id_capa_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."capa_investigations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa_verifications" ADD CONSTRAINT "capa_verifications_capa_id_capas_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."capas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capa_verifications" ADD CONSTRAINT "capa_verifications_action_id_capa_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."capa_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "directories_parent_id_idx" ON "directories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "directories_created_by_idx" ON "directories" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "document_approvals_document_id_idx" ON "document_approvals" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_approvals_approver_id_idx" ON "document_approvals" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "document_approvals_status_idx" ON "document_approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "document_approvals_approver_status_idx" ON "document_approvals" USING btree ("approver_id","status");--> statement-breakpoint
CREATE INDEX "document_permissions_document_user_idx" ON "document_permissions" USING btree ("document_id","user_id");--> statement-breakpoint
CREATE INDEX "document_permissions_user_id_idx" ON "document_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_versions_document_id_idx" ON "document_versions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_versions_file_hash_idx" ON "document_versions" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "documents_status_idx" ON "documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "documents_owner_id_idx" ON "documents" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "documents_directory_id_idx" ON "documents" USING btree ("directory_id");--> statement-breakpoint
CREATE INDEX "documents_category_id_idx" ON "documents" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "documents_next_review_date_idx" ON "documents" USING btree ("next_review_date");--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "documents_directory_status_idx" ON "documents" USING btree ("directory_id","status");--> statement-breakpoint
CREATE INDEX "change_request_approvals_change_request_id_idx" ON "change_request_approvals" USING btree ("change_request_id");--> statement-breakpoint
CREATE INDEX "change_request_approvals_approver_id_idx" ON "change_request_approvals" USING btree ("approver_id");--> statement-breakpoint
CREATE INDEX "change_request_approvals_status_idx" ON "change_request_approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "change_request_comments_change_request_id_idx" ON "change_request_comments" USING btree ("change_request_id");--> statement-breakpoint
CREATE INDEX "change_requests_requested_by_idx" ON "change_requests" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "change_requests_status_idx" ON "change_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "change_requests_priority_idx" ON "change_requests" USING btree ("priority");--> statement-breakpoint
ALTER TABLE "change_requests" DROP COLUMN "document_id";--> statement-breakpoint
ALTER TABLE "change_requests" DROP COLUMN "title";