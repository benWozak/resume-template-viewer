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
      profile: resumeData[0]?.summary || DEFAULT_PLACEHOLDER.resume.profile,
      socials: {
        linkedin_url: socialsData[0]?.linkedinUrl || DEFAULT_PLACEHOLDER.socials.linkedin_url,
        github_url: socialsData[0]?.githubUrl || DEFAULT_PLACEHOLDER.socials.github_url,
        portfolio_url: socialsData[0]?.portfolioUrl || DEFAULT_PLACEHOLDER.socials.portfolio_url,
      },
      experience: (experienceData.length > 0 ? experienceData : DEFAULT_PLACEHOLDER.experience).map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`,
        description: exp.description ? exp.description.split('\n') : [],
      })),
      skills: (skillsData.length > 0 ? skillsData : DEFAULT_PLACEHOLDER.skills).map(skill => ({
        skill_title: skill.category,
        skill_items: skill.items,
      })),
      education: {
        institution: educationData[0]?.institution || DEFAULT_PLACEHOLDER.education.institution,
        location: educationData[0]?.location || DEFAULT_PLACEHOLDER.education.location,
        duration: `${formatDate(educationData[0]?.startDate || DEFAULT_PLACEHOLDER.education.startDate)} - ${formatDate(educationData[0]?.endDate || DEFAULT_PLACEHOLDER.education.endDate)}`,
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
      profile: DEFAULT_PLACEHOLDER.resume.profile,
      socials: {
        linkedin_url: DEFAULT_PLACEHOLDER.socials.linkedin_url,
        github_url: DEFAULT_PLACEHOLDER.socials.github_url,
        portfolio_url: DEFAULT_PLACEHOLDER.socials.portfolio_url,
      },
      experience: DEFAULT_PLACEHOLDER.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: `${exp.startDate} - ${exp.endDate}`,
        description: exp.description.split('\n'),
      })),
      skills: DEFAULT_PLACEHOLDER.skills.map(skill => ({
        skill_title: skill.category,
        skill_items: skill.items,
      })),
      education: {
        institution: DEFAULT_PLACEHOLDER.education.institution,
        location: DEFAULT_PLACEHOLDER.education.location,
        duration: `${DEFAULT_PLACEHOLDER.education.startDate} - ${DEFAULT_PLACEHOLDER.education.endDate}`,
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
      await tx
        .update(resumeContent)
        .set({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          summary: data.summary,
          updatedAt: new Date(),
        })
        .where(eq(resumeContent.auth0UserId, userId));
    });

    await db.transaction(async (tx) => {
      await tx
        .update(socials)
        .set({
          linkedinUrl: data.linkedin,
          githubUrl: data.github,
          portfolioUrl: data.portfolio
        })
        .where(eq(resumeContent.auth0UserId, userId));
    });

    // experience
    data.experience.map(async (item: any, index: number) => {
      await db.transaction(async (tx) => {
        await tx
          .update(experience)
          .set({
            company: item.company,
            position: item.position,
            startDate: item.startDate,
            endDate: item.endDate,
            description: item.description,
          })
          .where(eq(resumeContent.auth0UserId, userId));
      });
    })

    data.skills.map(async(item: any, index: number) => {
      await db.transaction(async (tx) => {
        await tx
          .update(skills)
          .set({
            category: item.category,
            items: item.items
          })
          .where(eq(resumeContent.auth0UserId, userId));
      });
    })

    await db.transaction(async (tx) => {
      await tx
        .update(education)
        .set({
          institution: data.education.institution,
          location: data.education.location,
          startDate: data.education.startDate,
          endDate: data.education.endDate,
          degree: data.education.degree,
        })
        .where(eq(resumeContent.auth0UserId, userId));
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