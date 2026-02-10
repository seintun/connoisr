import { FeatureShowcase } from "@/app/components/landing/FeatureShowcase";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <HeroSection />
      <FeatureShowcase />
      
      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} Connoisr. Service as a Material.</p>
      </footer>
    </main>
  );
}
