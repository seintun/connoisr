import DinerPageClient from "./DinerPageClient";

// Pre-render table pages 1-20 at build time for fast CDN-edge TTFB.
// Pages beyond 20 are generated on-demand and cached via ISR.
export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function DinerPage() {
  return <DinerPageClient />;
}
