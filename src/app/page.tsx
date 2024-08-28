import Link from "next/link";
import Card from "@/components/resume/card";

export default function Home() {
  return (
    <main className="py-6">
      <div className="container m-auto">
        <div className="grid grid-rows-2 grid-flow-col gap-4">
          <Link href="/resume">
            <Card />
          </Link>
        </div>
      </div>
    </main>
  );
}
