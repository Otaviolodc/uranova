import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Products from "@/components/home/Products";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Hero />
      <TrustBar />
      <Products />
      <CTA />
    </main>
  );
}