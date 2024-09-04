"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getResumeData, updateResumeData } from "../actions";
import { ResumeData } from "@/util/types";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FullPageLoader } from "@/components/layout/loaders";

// Zod schema for form validation
const resumeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  linkedin_url: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolio_url: z
    .string()
    .url("Invalid portfolio URL")
    .optional()
    .or(z.literal("")),
  summary: z.string().max(500, "Summary must be 500 characters or less"),
  experience: z
    .array(
      z.object({
        company: z.string().min(1, "Company name is required"),
        position: z.string().min(1, "Position is required"),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
          .optional(),
        description: z
          .string()
          .max(1000, "Description must be 1000 characters or less"),
      })
    )
    .min(1, "At least one experience entry is required"),
  skills: z
    .array(
      z.object({
        category: z.string().min(1, "Category is required"),
        items: z.string().min(1, "Skills items are required"),
      })
    )
    .min(1, "At least one skill entry is required"),
  education: z.object({
    institution: z.string().min(1, "Institution is required"),
    location: z.string().min(1, "Location is required"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    degree: z.string().min(1, "Degree is required"),
  }),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function EditResumePage() {
  const { user, isLoading: userLoading } = useUser();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
  });

  useEffect(() => {
    if (user?.sub) {
      fetchResumeData(user.sub);
    }
  }, [user, fetchResumeData]);

  async function fetchResumeData(userId: string) {
    const data = await getResumeData(userId);
    //@ts-ignore
    setResumeData(data);
    //@ts-ignore
    reset(data); // Pre-fill the form with fetched data
  }

  async function onSubmit(data: ResumeFormData) {
    if (user?.sub) {
      await updateResumeData(user.sub, data);
    }
  }

  if (userLoading) return <FullPageLoader />;
  if (!user) return <div>Please log in to edit your resume</div>;
  if (!resumeData) return <div>Loading resume data...</div>;

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <InputField
              label="Full Name"
              name="full_name"
              register={register}
              errors={errors}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              register={register}
              errors={errors}
            />
            <InputField
              label="Phone"
              name="phone"
              register={register}
              errors={errors}
            />
            <InputField
              label="LinkedIn URL"
              name="linkedin_url"
              register={register}
              errors={errors}
            />
            <InputField
              label="GitHub URL"
              name="github_url"
              register={register}
              errors={errors}
            />
            <InputField
              label="Portfolio URL"
              name="portfolio_url"
              register={register}
              errors={errors}
            />
            <TextareaField
              label="Summary"
              name="summary"
              register={register}
              errors={errors}
            />
          </div>
        </section>

        <section className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Experience</h2>
          {resumeData.experience.map((_, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">
                Experience {index + 1}
              </h3>
              <InputField
                label="Company"
                name={`experience.${index}.company`}
                register={register}
                errors={errors}
              />
              <InputField
                label="Position"
                name={`experience.${index}.position`}
                register={register}
                errors={errors}
              />
              <InputField
                label="Start Date"
                name={`experience.${index}.startDate`}
                type="date"
                register={register}
                errors={errors}
              />
              <InputField
                label="End Date"
                name={`experience.${index}.endDate`}
                type="date"
                register={register}
                errors={errors}
              />
              <TextareaField
                label="Description"
                name={`experience.${index}.description`}
                register={register}
                errors={errors}
              />
            </div>
          ))}
        </section>

        <section className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Skills</h2>
          {resumeData.skills.map((_, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">
                Skill Category {index + 1}
              </h3>
              <InputField
                label="Category"
                name={`skills.${index}.category`}
                register={register}
                errors={errors}
              />
              <TextareaField
                label="Items"
                name={`skills.${index}.items`}
                register={register}
                errors={errors}
              />
            </div>
          ))}
        </section>

        <section className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Education</h2>
          <InputField
            label="Institution"
            name="education.institution"
            register={register}
            errors={errors}
          />
          <InputField
            label="Location"
            name="education.location"
            register={register}
            errors={errors}
          />
          <InputField
            label="Start Date"
            name="education.startDate"
            type="date"
            register={register}
            errors={errors}
          />
          <InputField
            label="End Date"
            name="education.endDate"
            type="date"
            register={register}
            errors={errors}
          />
          <InputField
            label="Degree"
            name="education.degree"
            register={register}
            errors={errors}
          />
        </section>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            Save Resume
          </button>
        </div>
      </form>
    </main>
  );
}

interface FieldProps {
  label: string;
  name: string;
  register: any;
  errors: any;
  type?: string;
  rows?: number;
}

function InputField({
  label,
  name,
  register,
  errors,
  type = "text",
}: FieldProps) {
  return (
    <label htmlFor={name} className="form-control w-full max-w-xs">
      <span className="label label-text">{label}</span>
      <input
        type={type}
        placeholder="Type here"
        id={name}
        {...register(name)}
        className="input input-bordered w-full"
      />
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">{errors[name].message}</p>
      )}
    </label>
  );
}

function TextareaField({ label, name, register, errors, rows }: FieldProps) {
  return (
    <label htmlFor={name} className="form-control">
      <span className="label label-text">{label}</span>
      <textarea
        id={name}
        {...register(name)}
        className="textarea textarea-bordered h-24"
        rows={rows}
      ></textarea>
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">{errors[name].message}</p>
      )}
    </label>
  );
}
