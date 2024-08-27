import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to My Resume Site</h1>
      <Link href="/resume">View My Resume</Link>
    </div>
  );
}
