import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
};

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">You are offline</h1>
      <p className="text-lg text-muted-foreground">
        Please check your internet connection and try again.
      </p>
    </div>
  );
}
