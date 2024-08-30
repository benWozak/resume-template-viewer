CREATE TABLE IF NOT EXISTS "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"institution" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"degree" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"company" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resume_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"summary" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resume_content_auth0_user_id_unique" UNIQUE("auth0_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resume_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"items" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"linkedin_url" varchar(255),
	"github_url" varchar(255),
	"portfolio_url" varchar(255),
	CONSTRAINT "socials_auth0_user_id_unique" UNIQUE("auth0_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"template_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_auth0_user_id_resume_content_auth0_user_id_fk" FOREIGN KEY ("auth0_user_id") REFERENCES "public"."resume_content"("auth0_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experience" ADD CONSTRAINT "experience_auth0_user_id_resume_content_auth0_user_id_fk" FOREIGN KEY ("auth0_user_id") REFERENCES "public"."resume_content"("auth0_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skills" ADD CONSTRAINT "skills_auth0_user_id_resume_content_auth0_user_id_fk" FOREIGN KEY ("auth0_user_id") REFERENCES "public"."resume_content"("auth0_user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_template_id_resume_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."resume_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
