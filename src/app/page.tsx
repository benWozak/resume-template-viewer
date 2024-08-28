import Link from "next/link";

export default function Home() {
  return (
    <main className="mt-4">
      <h1>Welcome to My Resume Site</h1>
      <Link href="/resume">View My Resume</Link>
    </main>
  );
}
