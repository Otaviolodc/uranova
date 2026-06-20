import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Products from "@/components/home/Products";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import MembersArea from "@/components/home/MembersArea";
import Analytics from "@/components/home/Analytics";
import Comparison from "@/components/home/Comparison";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Hero />
      <TrustBar />
      <Products />
      <HowItWorks />
      <Features />
      <MembersArea />
      <Analytics />
      <Comparison />
      <FAQ />
      <CTA />
    </main>
  );
}