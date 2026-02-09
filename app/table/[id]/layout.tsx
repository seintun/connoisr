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
      <div className="min-h-screen bg-background text-foreground pb-20">
        {children}
      </div>
    </TableSessionProvider>
  );
}
