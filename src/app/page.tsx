import { use, Suspense } from "react";
import { getResumeTemplates } from "./actions";
import Card from "@/components/resume/card";

function TemplateList() {
  const templates = use(getResumeTemplates());

  return (
    <div className="grid grid-rows-2 grid-flow-col gap-4">
      {templates.map((template) => (
        <Card key={template.name} template={template} />
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <main className="py-6">
      <div className="container m-auto">
        {/* <Suspense fallback={<FullPageLoader />}> */}
        <TemplateList />
        {/* </Suspense> */}
      </div>
    </main>
  );
}
