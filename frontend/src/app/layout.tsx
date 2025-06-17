import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostsProvider } from "@/contexts/PostsContext";
import { fetchPostsOnServer } from "@/services";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Posts App - Next.js with App Router",
  description: "A full-stack posts application with authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial posts on the server
  let initialPosts: any[] = [];
  try {
    initialPosts = await fetchPostsOnServer();
  } catch (error) {
    console.error("Failed to fetch initial posts:", error);
    initialPosts = [];
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <PostsProvider initialPosts={initialPosts}>
          {children}
        </PostsProvider>
      </body>
    </html>
  );
}
