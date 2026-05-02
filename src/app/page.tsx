import { HeroSection } from "@/components/HeroSection";
import { HomePageClient } from "@/components/HomePageClient";
import { Navbar } from "@/components/Navbar";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <HeroSection />
      <HomePageClient />
    </main>
  );
}
