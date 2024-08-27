'use server'

import { revalidatePath } from 'next/cache';

interface GenerateResumeResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
  debug?: any;
}

export async function generateResume(): Promise<GenerateResumeResult> {
  try {
    console.log('Fetching data from local Strapi CMS...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { data } = await response.json();
    console.log('Data fetched successfully:', data);

    // Process the data for LaTeX
    const processedData = {
      full_name: data.attributes.full_name,
      phone: data.attributes.phone,
      email: data.attributes.email,
      profile: data.attributes.profile.profile_text,
      socials: {
        id: data.attributes.socials.id,
        linkedin_url: data.attributes.socials.linkedin_url,
        github_url: data.attributes.socials.github_url,
        portfolio_url: data.attributes.socials.portfolio_url
      },
      experience: data.attributes.experience.map((exp: any) => ({
        company: exp.company,
        duration: `${exp.start_date} - ${exp.end_date}`,
        position: exp.job_title,
        description: [exp.bullet_1, exp.bullet_2, exp.bullet_3].filter(Boolean)
      })),
      skills: data.attributes.skills.map((item: any) => ({
        id: item.id,
        skill_title: item.skill_title,
        skill_items: item.skill_items
      })),
      education: {
        id: data.attributes.education.id,
        institution: data.attributes.education.institution,
        location: data.attributes.education.location,
        duration: `${data.attributes.education.start_date} - ${data.attributes.education.end_date}`,
        degree: data.attributes.education.degree
      }
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
    console.log('PDF generated successfully:', result);
    revalidatePath('/resume');
    return result;
  } catch (error) {
    console.error('Error in generateResume:', error);
    return { 
      success: false, 
      error: (error as Error).message,
      debug: {
        strapiUrl: 'http://localhost:1337/api/templates/1',
        nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        errorStack: (error as Error).stack
      }
    };
  }
}