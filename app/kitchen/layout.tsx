"use client";


export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen bg-neutral-900 text-neutral-50">
        {children}
      </div>
  );
}
