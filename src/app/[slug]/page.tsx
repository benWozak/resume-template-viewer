import { notFound } from "next/navigation";
import { getResumeTemplates, generateResumePDF } from "../actions";

export async function generateStaticParams() {
  const templates = await getResumeTemplates();
  return templates.map((template) => ({
    slug: template.slug,
  }));
}

export default async function TemplatePage({
  params,
}: {
  params: { slug: string };
}) {
  const templates = await getResumeTemplates();
  const template = templates.find((t) => t.slug === params.slug);

  if (!template) {
    notFound();
  }

  // TODO: Replace null with actual user ID from authentication when implemented
  const userId = null;
  const { success, pdfPath, error } = await generateResumePDF(
    userId,
    template.slug
  );

  if (!success || !pdfPath) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error generating resume</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{template.name}</h1>
      <p className="text-gray-600 mb-4">{template.description}</p>
      Here is my solution to this problem.
      <object data={pdfPath} type="application/pdf" width="100%" height="600px">
        <embed src={pdfPath} width="100%" height="800px" />
      </object>
    </div>
  );
}
