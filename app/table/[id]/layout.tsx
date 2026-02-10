"use client";

import { TableSessionProvider } from "@/components/providers/TableSessionProvider";
import { useParams } from "next/navigation";



import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DinerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string;

  return (
    <TableSessionProvider tableId={id}>
      <div className="min-h-screen bg-background text-foreground pb-24 relative [overflow-x:clip] transition-colors duration-300">
         {/* Ambient Background Glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-secondary/20 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle className="bg-background/50 backdrop-blur-md border-border/50" />
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </TableSessionProvider>
  );
}
