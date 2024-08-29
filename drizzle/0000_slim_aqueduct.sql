CREATE TABLE IF NOT EXISTS "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"institution" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"degree" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "resume" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"profile" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"items" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"linkedin_url" varchar(255) NOT NULL,
	"github_url" varchar(255) NOT NULL,
	"portfolio_url" varchar(255) NOT NULL
);
