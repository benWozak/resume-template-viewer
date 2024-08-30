import { pgTable, serial, text, varchar, date, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Resume template table (accessible to unauthenticated users)
export const resumeTemplates = pgTable('resume_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: uniqueIndex('name_idx').on(table.name),
  }
});

// User's resume table (links Auth0 user ID to templates)
export const userResumes = pgTable('user_resumes', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull(),
  templateId: integer('template_id').notNull().references(() => resumeTemplates.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Resume content table (one per user)
export const resumeContent = pgTable('resume_content', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  summary: text('summary'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const socials = pgTable('socials', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull().unique(),
  linkedinUrl: varchar('linkedin_url', { length: 255 }),
  githubUrl: varchar('github_url', { length: 255 }),
  portfolioUrl: varchar('portfolio_url', { length: 255 }),
});

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull().references(() => resumeContent.auth0UserId),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  description: text('description'),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull().references(() => resumeContent.auth0UserId),
  category: varchar('category', { length: 100 }).notNull(),
  items: text('items').notNull(),
});

export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  auth0UserId: varchar('auth0_user_id', { length: 255 }).notNull().references(() => resumeContent.auth0UserId),
  institution: varchar('institution', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  degree: varchar('degree', { length: 255 }).notNull(),
});

// Relations
export const resumeTemplateRelations = relations(resumeTemplates, ({ many }) => ({
  userResumes: many(userResumes),
}));

export const userResumeRelations = relations(userResumes, ({ one }) => ({
  template: one(resumeTemplates, {
    fields: [userResumes.templateId],
    references: [resumeTemplates.id],
  }),
}));

export const resumeContentRelations = relations(resumeContent, ({ one, many }) => ({
  socials: one(socials, {
    fields: [resumeContent.auth0UserId],
    references: [socials.auth0UserId],
  }),
  experiences: many(experience),
  education: many(education),
  skills: many(skills),
}));