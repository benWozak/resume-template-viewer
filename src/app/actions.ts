'use server'

import { revalidatePath } from 'next/cache';
import { db } from '../../db/config';
import { resume, socials, experience, skills, education } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { DEFAULT_PLACEHOLDER } from '@/util/constants'

interface GenerateResumeResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
  debug?: any;
}

interface ResumeData {
  full_name: string;
  phone: string;
  email: string;
  profile: string;
  socials: {
    linkedin_url: string;
    github_url: string;
    portfolio_url: string;
  };
  experience: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string[];
  }[];
  skills: {
    category: string;
    items: string;
  }[];
  education: {
    id: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    degree: string;
  };
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Present';
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

export async function generateResume(): Promise<GenerateResumeResult> {
  try {
    console.log('Fetching data from database');
    
    // Fetch data from database
    const resumeData = await db.select().from(resume).limit(1);
    const socialsData = await db.select().from(socials).limit(1);
    const experienceData = await db.select().from(experience).orderBy(desc(experience.startDate));
    const skillsData = await db.select().from(skills);
    const educationData = await db.select().from(education).limit(1);

    // Process the data for LaTeX
    const processedData = {
      full_name: resumeData[0]?.fullName || DEFAULT_PLACEHOLDER.resume.full_name,
      phone: resumeData[0]?.phone || DEFAULT_PLACEHOLDER.resume.phone,
      email: resumeData[0]?.email || DEFAULT_PLACEHOLDER.resume.email,
      profile: resumeData[0]?.profile || DEFAULT_PLACEHOLDER.resume.profile,
      socials: {
        linkedin_url: socialsData[0]?.linkedinUrl || DEFAULT_PLACEHOLDER.socials.linkedin_url,
        github_url: socialsData[0]?.githubUrl || DEFAULT_PLACEHOLDER.socials.github_url,
        portfolio_url: socialsData[0]?.portfolioUrl || DEFAULT_PLACEHOLDER.socials.portfolio_url,
      },
      experience: (experienceData.length > 0 ? experienceData : DEFAULT_PLACEHOLDER.experience).map((exp: any) => ({
        company: exp.company,
        duration: `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`,
        position: exp.position,
        description: exp.description ? exp.description.split('\n') : [],
      })),
      skills: (skillsData.length > 0 ? skillsData : DEFAULT_PLACEHOLDER.skills).map((item: any) => ({
        id: item.id,
        skill_title: item.category,
        skill_items: item.items,
      })),
      education: {
        institution: educationData[0]?.institution || DEFAULT_PLACEHOLDER.education.institution,
        location: educationData[0]?.location || DEFAULT_PLACEHOLDER.education.location,
        duration: `${formatDate(educationData[0]?.startDate || DEFAULT_PLACEHOLDER.education.startDate)} - ${formatDate(educationData[0]?.endDate || DEFAULT_PLACEHOLDER.education.endDate)}`,
        degree: educationData[0]?.degree || DEFAULT_PLACEHOLDER.education.degree,
      },
    };

    console.log('Generating PDF...');
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedData),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate resume. Status: ${res.status}`);
    }

    const result = await res.json();
    console.log('PDF generated successfully:');
    revalidatePath('/resume');
    return result;
  } catch (error) {
    console.error('Error in generateResume:', error);
    return { 
      success: false, 
      error: (error as Error).message,
      debug: {
        nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        errorStack: (error as Error).stack
      }
    };
  }
}

export async function updateResumeData(data: ResumeData) {
  try {
    // Update or insert resume data
    await db.insert(resume).values({
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      profile: data.profile,
    }).onConflictDoUpdate({
      target: resume.id,
      set: {
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        profile: data.profile,
      },
    });

    // Update or insert socials data
    await db.insert(socials).values({
      linkedinUrl: data.socials.linkedin_url,
      githubUrl: data.socials.github_url,
      portfolioUrl: data.socials.portfolio_url,
    }).onConflictDoUpdate({
      target: socials.id,
      set: {
        linkedinUrl: data.socials.linkedin_url,
        githubUrl: data.socials.github_url,
        portfolioUrl: data.socials.portfolio_url,
      },
    });

    // Delete existing experience entries and insert new ones
    await db.delete(experience);
    for (const exp of data.experience) {
      await db.insert(experience).values({
        //@ts-ignore
        company: exp.company,
        position: exp.position,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        description: exp.description.join('\n'),
      });
    }

    // Delete existing skills entries and insert new ones
    await db.delete(skills);
    for (const skill of data.skills) {
      await db.insert(skills).values({
        category: skill.category,
        items: skill.items,
      });
    }

    // Update or insert education data
    await db.insert(education).values({
      //@ts-ignore
      institution: data.education.institution,
      location: data.education.location,
      startDate: new Date(data.education.startDate),
      endDate: new Date(data.education.endDate),
      degree: data.education.degree,
    }).onConflictDoUpdate({
      target: education.id,
      set: {
        institution: data.education.institution,
        location: data.education.location,
        startDate: data.education.startDate,
        endDate: data.education.endDate,
        degree: data.education.degree,
      },
    });

    console.log('Resume data updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating resume data:', error);
    return { success: false, error: (error as Error).message };
  }
}