"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getResumeData, updateResumeData } from "../actions";
import { ResumeData } from "@/util/types";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import dynamic from "next/dynamic";

const FullPageLoader = dynamic(() => import("@/components/layout/loader"), {
  ssr: false,
});

const resumeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  socials: z.object({
    linkedin_url: z
      .string()
      .url("Invalid LinkedIn URL")
      .optional()
      .or(z.literal("")),
    github_url: z
      .string()
      .url("Invalid GitHub URL")
      .optional()
      .or(z.literal("")),
    portfolio_url: z
      .string()
      .url("Invalid portfolio URL")
      .optional()
      .or(z.literal("")),
  }),
  summary: z.string().max(500, "Summary must be 500 characters or less"),
  experience: z
    .array(
      z.object({
        company: z.string().min(1, "Company name is required"),
        position: z.string().min(1, "Position is required"),
        duration: z.object({
          startDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
          endDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
            .nullable(),
        }),
        description: z
          .array(z.string())
          .min(1, "At least one description item is required"),
      })
    )
    .min(1, "At least one experience entry is required"),
  skills: z
    .array(
      z.object({
        skill_title: z.string().min(1, "Category is required"),
        skill_items: z.string().min(1, "Skills items are required"),
      })
    )
    .min(3, "At least three skill entries are required")
    .max(6, "Maximum of six skill entries allowed")
    .min(1, "At least one skill entry is required"),
  education: z.object({
    institution: z.string().min(1, "Institution is required"),
    location: z.string().min(1, "Location is required"),
    duration: z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
        .nullable(),
    }),
    degree: z.string().min(1, "Degree is required"),
  }),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function Page() {
  const { user, isLoading: userLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "skills",
  });

  useEffect(() => {
    if (user?.sub) {
      fetchResumeData(user.sub);
    }
    // @eslint-ignore react-hooks/exhaustive-deps
  }, [user]);

  async function fetchResumeData(userId: string) {
    const data: ResumeData = await getResumeData(userId);
    // Ensure there are at least 3 skill entries
    while (data.skills.length < 3) {
      data.skills.push({ skill_title: "", skill_items: "" });
    }
    setResumeData(data);
    reset(data);
  }

  async function onSubmit(data: ResumeFormData) {
    if (user?.sub) {
      setIsSaving(true);
      try {
        const result = await updateResumeData(user.sub, data);
        if (result.success) {
          toast.success("Resume saved successfully!");
        } else {
          toast.error("Failed to save resume. Please try again.");
        }
      } catch (error) {
        console.error("Error saving resume:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  }

  if (userLoading) return <FullPageLoader />;
  if (!user) return <div>Please log in to edit your resume</div>;
  if (!resumeData) return <FullPageLoader />;

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <InputField
              label="Full Name"
              name="full_name"
              register={register}
              errors={errors}
            />
            <div className="flex gap-2 flex-col md:flex-row">
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
            </div>
            <div className="flex gap-2 flex-col md:flex-row">
              <InputField
                label="LinkedIn URL"
                name="socials.linkedin_url"
                register={register}
                errors={errors}
              />
              <InputField
                label="GitHub URL"
                name="socials.github_url"
                register={register}
                errors={errors}
              />
              <InputField
                label="Portfolio URL"
                name="socials.portfolio_url"
                register={register}
                errors={errors}
              />
            </div>
            <TextareaField
              label="Summary"
              name="summary"
              register={register}
              errors={errors}
            />
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Experience</h2>
          {resumeData.experience.map((_, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
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
                name={`experience.${index}.duration.startDate`}
                type="date"
                register={register}
                errors={errors}
              />
              <InputField
                label="End Date"
                name={`experience.${index}.duration.endDate`}
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

        <section className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">tools & Technologies</h2>
          {skillFields.map((field, index) => (
            <div key={field.id} className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold mb-2">
                Category {index + 1}
              </h3>
              <InputField
                label="Category"
                name={`skills.${index}.skill_title`}
                register={register}
                errors={errors}
              />
              <TextareaField
                label="Items"
                name={`skills.${index}.skill_items`}
                register={register}
                errors={errors}
              />
              {skillFields.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="btn btn-error btn-sm mt-2"
                >
                  Remove Skill
                </button>
              )}
            </div>
          ))}
          {skillFields.length < 6 && (
            <button
              type="button"
              onClick={() => appendSkill({ skill_title: "", skill_items: "" })}
              className="btn btn-primary btn-sm mt-2"
            >
              Add Skill
            </button>
          )}
        </section>

        <section className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
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
            name="education.duration.startDate"
            type="date"
            register={register}
            errors={errors}
          />
          <InputField
            label="End Date"
            name="education.duration.endDate"
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
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Resume"}
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
    <label htmlFor={name} className="form-control w-full">
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
      <span className="label label-text-alt">Use commas to separate items</span>
      {errors[name] && (
        <p className="mt-2 text-sm text-red-600">{errors[name].message}</p>
      )}
    </label>
  );
}
