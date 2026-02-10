"use client";

import { TableSessionProvider } from "@/components/providers/TableSessionProvider";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TableSessionProvider>
      <div className="min-h-screen bg-neutral-900 text-neutral-50">
        {children}
      </div>
    </TableSessionProvider>
  );
}
