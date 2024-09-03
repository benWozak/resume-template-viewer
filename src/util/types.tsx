export type ExperienceData = {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type SkillsData = {
  category: string;
  items: string;
};

export type EducationData = {
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  degree: string;
};

export interface ResumeData {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  summary: string;
  experience: ExperienceData[];
  skills: SkillsData[];
  education: EducationData;
}
