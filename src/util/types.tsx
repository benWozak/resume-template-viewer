export type SocialsData = {
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
};

export interface ExperienceData {
  company: string;
  position: string;
  duration: {
    startDate: string;
    endDate: string | null;
  };
  description: string[];
}

export type SkillsData = {
  skill_title: string;
  skill_items: string;
};

export interface EducationData {
  institution: string;
  location: string;
  duration: {
    startDate: string;
    endDate: string | null;
  };
  degree: string;
}

export interface ResumeData {
  full_name: string;
  email: string;
  phone: string;
  socials: SocialsData;
  summary: string;
  experience: ExperienceData[];
  skills: SkillsData[];
  education: EducationData;
}
