import { generateResume } from "../actions";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function ResumePage() {
  const { success, pdfPath, error, debug } = await generateResume();

  if (!success || !pdfPath) {
    return (
      <div>
        <h1>Error generating resume</h1>
        <p>{error}</p>
        {debug && (
          <details>
            <summary>Debug Information</summary>
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          </details>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>My Resume</h1>
      <iframe src={pdfPath} width="100%" height="800px" />
    </div>
  );
}
