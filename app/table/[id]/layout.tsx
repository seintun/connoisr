"use client";

import { TableSessionProvider, useTableSession } from "@/components/providers/TableSessionProvider";
import { useParams } from "next/navigation";
import { useEffect } from "react";

function TableInitializer({ id }: { id: string }) {
  const { initializeSession } = useTableSession();

  useEffect(() => {
    initializeSession(id);
  }, [id, initializeSession]);

  return null;
}

export default function DinerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string;

  return (
    <TableSessionProvider>
      <TableInitializer id={id} />
      <div className="min-h-screen bg-background text-foreground pb-24 relative [overflow-x:clip]">
         {/* Ambient Background Glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-secondary/20 blur-[100px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </TableSessionProvider>
  );
}
