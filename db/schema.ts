import { pgTable, serial, text, varchar, date } from 'drizzle-orm/pg-core';

export const resume = pgTable('resume', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  profile: text('profile'),
});

export const socials = pgTable('socials', {
    id: serial('id').primaryKey(),
    linkedinUrl: varchar('linkedin_url', { length: 255 }).notNull(),
    githubUrl: varchar('github_url', { length: 255 }).notNull(),
    portfolioUrl: varchar('portfolio_url', { length: 255 }).notNull(),
})

export const experience = pgTable('experience', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  description: text('description'),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  items: text('items').notNull(),
});

export const education = pgTable('education', {
    id: serial('id').primaryKey(),
    institution: varchar('institution', { length: 255 }).notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    degree: varchar('degree', { length: 255 }).notNull(),
})