import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-serif font-bold tracking-tight text-primary">
          TempoDine
        </h1>
        <p className="text-xl text-muted-foreground font-sans max-w-md mx-auto">
          Experience the future of dining. Seamless, elegant, and efficient.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/table/1" className="px-6 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity">
            Diner App
          </Link>
          <Link href="/kitchen" className="px-6 py-2 border border-border rounded-sm font-medium hover:bg-muted transition-colors">
            Kitchen Display
          </Link>
        </div>
      </div>
    </main>
  );
}
