import { z } from "zod";

export const ContactSchema = z.object({
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  links: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .optional()
    .default([]),
});

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional().nullable(),
  period: z.string(),
  achievements: z.array(z.string()).default([]),
  stack: z.array(z.string()).optional().default([]),
});

export const EducationSchema = z.object({
  degree: z.string(),
  school: z.string(),
  period: z.string(),
  details: z.string().optional().nullable(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  stack: z.array(z.string()).optional().default([]),
  url: z.string().optional().nullable(),
});

export const SkillsSchema = z.object({
  technical: z.array(z.string()).default([]),
  soft: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export const CvProfileSchema = z.object({
  fullName: z.string(),
  headline: z.string().optional().nullable(),
  contact: ContactSchema,
  summary: z.string().optional().nullable(),
  experiences: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: SkillsSchema,
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(z.string()).default([]),
});

export type CvProfile = z.infer<typeof CvProfileSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Skills = z.infer<typeof SkillsSchema>;

export const TEMPLATES = [
  { id: "fullstack-ia", name: "FullStack IA", description: "Profil dev full-stack orienté IA" },
  { id: "automatisation-ia", name: "Automatisation IA", description: "Profil automatisation et agents IA" },
  { id: "developpement-web", name: "Développement Web", description: "Profil développeur web classique" },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];
