'use server'

import { db } from '../db';
import { resumeTemplates, resumeContent, socials, experience, skills, education } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { DEFAULT_PLACEHOLDER } from '@/util/constants';

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Present';
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

export async function getResumeTemplates() {
  try {
    const templates = await db.select({
      id: resumeTemplates.id,
      name: resumeTemplates.name,
      slug: resumeTemplates.slug,
      description: resumeTemplates.description,
    }).from(resumeTemplates);
    return templates;
  } catch (error) {
    console.error('Failed to fetch resume templates:', error);
    throw new Error('Failed to fetch resume templates');
  }
}

export async function getResumeData(userId: string) {
  try {
    const resumeData = await db.select().from(resumeContent).where(eq(resumeContent.auth0UserId, userId)).limit(1);
    const socialsData = await db.select().from(socials).where(eq(socials.auth0UserId, userId)).limit(1);
    const experienceData = await db.select().from(experience).where(eq(experience.auth0UserId, userId)).orderBy(desc(experience.startDate));
    const skillsData = await db.select().from(skills).where(eq(skills.auth0UserId, userId));
    const educationData = await db.select().from(education).where(eq(education.auth0UserId, userId)).limit(1);

    return {
      full_name: resumeData[0]?.fullName || DEFAULT_PLACEHOLDER.resume.full_name,
      phone: resumeData[0]?.phone || DEFAULT_PLACEHOLDER.resume.phone,
      email: resumeData[0]?.email || DEFAULT_PLACEHOLDER.resume.email,
      summary: resumeData[0]?.summary || DEFAULT_PLACEHOLDER.resume.summary,
      socials: {
        linkedin_url: socialsData[0]?.linkedinUrl || DEFAULT_PLACEHOLDER.socials.linkedin_url,
        github_url: socialsData[0]?.githubUrl || DEFAULT_PLACEHOLDER.socials.github_url,
        portfolio_url: socialsData[0]?.portfolioUrl || DEFAULT_PLACEHOLDER.socials.portfolio_url,
      },
      experience: (experienceData.length > 0 ? experienceData : DEFAULT_PLACEHOLDER.experience).map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: {
          startDate: formatDate(exp.startDate),
          endDate: exp.endDate ? formatDate(exp.endDate) : null,
        },
        description: exp.description ? exp.description.split('\n') : [],
      })),
      skills: (skillsData.length > 0 ? skillsData : DEFAULT_PLACEHOLDER.skills).map(skill => ({
        skill_title: skill.category,
        skill_items: skill.items,
      })),
      education: {
        institution: educationData[0]?.institution || DEFAULT_PLACEHOLDER.education.institution,
        location: educationData[0]?.location || DEFAULT_PLACEHOLDER.education.location,
        duration: {
          startDate: formatDate(educationData[0]?.startDate || DEFAULT_PLACEHOLDER.education.startDate),
          endDate: educationData[0]?.endDate ? formatDate(educationData[0].endDate) : null,
        },
        degree: educationData[0]?.degree || DEFAULT_PLACEHOLDER.education.degree,
      },
    };
  } catch (error) {
    console.error('Error fetching resume data:', error);
    // Return placeholder data in the same structure as the database data
    return {
      full_name: DEFAULT_PLACEHOLDER.resume.full_name,
      phone: DEFAULT_PLACEHOLDER.resume.phone,
      email: DEFAULT_PLACEHOLDER.resume.email,
      summary: DEFAULT_PLACEHOLDER.resume.summary,
      socials: {
        linkedin_url: DEFAULT_PLACEHOLDER.socials.linkedin_url,
        github_url: DEFAULT_PLACEHOLDER.socials.github_url,
        portfolio_url: DEFAULT_PLACEHOLDER.socials.portfolio_url,
      },
      experience: DEFAULT_PLACEHOLDER.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: {
          startDate: formatDate(exp.startDate),
          endDate: exp.endDate ? formatDate(exp.endDate) : null,
        },
        description: exp.description.split('\n'),
      })),
      skills: DEFAULT_PLACEHOLDER.skills.map(skill => ({
        skill_title: skill.category,
        skill_items: skill.items,
      })),
      education: {
        institution: DEFAULT_PLACEHOLDER.education.institution,
        location: DEFAULT_PLACEHOLDER.education.location,
        duration: {
          startDate: formatDate(DEFAULT_PLACEHOLDER.education.startDate),
          endDate: formatDate(DEFAULT_PLACEHOLDER.education.endDate),
        },
        degree: DEFAULT_PLACEHOLDER.education.degree,
      },
    };
  }
}

export async function generateResumePDF(userId: string | null, templateName: string) {
  try {
    const resumeData = await getResumeData(userId || 'placeholder');
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...resumeData, templateName }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate resume. Status: ${res.status}`);
    }

    const result = await res.json();
    return { success: true, pdfPath: result.pdfPath };
  } catch (error) {
    console.error('Error generating resume PDF:', error);
    return { 
      success: false, 
      error: (error as Error).message,
    };
  }
}

export async function updateResumeData(userId: string, data: any) {
  try {
    await db.transaction(async (tx) => {
      // Check if user exists in resume_content
      const existingUser = await tx
        .select()
        .from(resumeContent)
        .where(eq(resumeContent.auth0UserId, userId))
        .limit(1);

      if (existingUser.length === 0) {
        // If user doesn't exist, create a new entry
        await tx.insert(resumeContent).values({
          auth0UserId: userId,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          summary: data.summary,
          updatedAt: new Date(),
        });
      } else {
        // If user exists, update their information
        await tx
          .update(resumeContent)
          .set({
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            summary: data.summary,
            updatedAt: new Date(),
          })
          .where(eq(resumeContent.auth0UserId, userId));
      }

      // Update socials
      const existingSocials = await tx
        .select()
        .from(socials)
        .where(eq(socials.auth0UserId, userId))
        .limit(1);

      if (existingSocials.length === 0) {
        await tx.insert(socials).values({
          auth0UserId: userId,
          linkedinUrl: data.socials.linkedin_url,
          githubUrl: data.socials.github_url,
          portfolioUrl: data.socials.portfolio_url,
        });
      } else {
        await tx
          .update(socials)
          .set({
            linkedinUrl: data.socials.linkedin_url,
            githubUrl: data.socials.github_url,
            portfolioUrl: data.socials.portfolio_url,
          })
          .where(eq(socials.auth0UserId, userId));
      }

      // Update experience
      await tx.delete(experience).where(eq(experience.auth0UserId, userId));
      await tx.insert(experience).values(
        data.experience.map((exp: any) => ({
          auth0UserId: userId,
          company: exp.company,
          position: exp.position,
          startDate: exp.duration.startDate,
          endDate: exp.duration.endDate ? exp.duration.endDate : null,
          description: exp.description.join('\n'),
        }))
      );

      // Update skills
      await tx.delete(skills).where(eq(skills.auth0UserId, userId));
      await tx.insert(skills).values(
        data.skills.map((skill: any) => ({
          auth0UserId: userId,
          category: skill.skill_title,
          items: skill.skill_items,
        }))
      );

    // Update education
    const existingEducation = await tx
      .select()
      .from(education)
      .where(eq(education.auth0UserId, userId))
      .limit(1);

    if (existingEducation.length === 0) {
    await tx.insert(education).values({
      //@ts-ignore
      auth0UserId: userId,
      institution: data.education.institution,
      location: data.education.location,
      startDate: data.education.duration.startDate,
      endDate: data.education.duration.endDate ? data.education.duration.endDate : null,
      degree: data.education.degree,
    });
    } else {
    await tx
      .update(education)
      .set({
        institution: data.education.institution,
        location: data.education.location,
        startDate: data.education.duration.startDate,
        endDate: data.education.duration.endDate ? data.education.duration.endDate : null,
        degree: data.education.degree,
      })
      .where(eq(education.auth0UserId, userId));
    }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating resume data:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTemplate(id: number, name?: string, description?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/update-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name, description }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Template updated successfully:', data.updatedTemplate);
      return { success: true, updatedTemplate: data.updatedTemplate };
    } else {
      console.error('Failed to update template:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}