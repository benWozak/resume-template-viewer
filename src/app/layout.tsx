import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import NavBar from "@/components/layout/nav-bar";
import Footer from "@/components/layout/footer";
import { Toaster } from "react-hot-toast";

// const notoSans = Montserrat({ subsets: ["latin"] });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "ResumeBuilder | Create Professional Resumes",
  description:
    "Build and customize your professional resume with our easy-to-use online tool. Choose from multiple templates and showcase your skills effectively.",
  keywords: [
    "resume",
    "CV",
    "job application",
    "career",
    "professional profile",
    "templates",
  ],
  authors: [{ name: "Ben Wozak", url: "https://benwozak.netlify.app/" }],
  creator: "Ben Wozak",
  publisher: "ResumeBuilder",
  openGraph: {
    title: "ResumeBuilder | Crafting the Perfect Resume",
    description:
      "Create a standout resume in minutes. Choose from professionally designed templates and tailor your resume to land your dream job.",
    url: "https://resume-template-viewer.vercel.app/",
    siteName: "ResumeBuilder",
    images: [
      {
        url: "https://resume-template-viewer.vercel.app/resume_icon.png",
        width: 1200,
        height: 630,
        alt: "ResumeBuilder - Create professional resumes easily",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeBuilder | Your Path to Career Success",
    description:
      "Design a professional resume that gets you noticed. Multiple templates, easy customization, and expert tips to help you land interviews.",
    images: ["https://resume-template-viewer.vercel.app/resume_icon.png"],
  },
  themeColor: "#0047AB",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="fantasy" lang="en">
      <UserProvider>
        <body className={`${notoSans.className}  bg-base-200`}>
          <NavBar />
          {children}
          <Toaster />
          <Footer />
        </body>
      </UserProvider>
    </html>
  );
}
