ALTER TABLE "resume_templates" DROP CONSTRAINT "resume_templates_name_unique";--> statement-breakpoint
ALTER TABLE "resume_templates" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "slug_idx" ON "resume_templates" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "resume_templates" ADD CONSTRAINT "resume_templates_slug_unique" UNIQUE("slug");