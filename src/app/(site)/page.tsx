import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Products from "@/components/home/Products";
import CTA from "@/components/home/CTA";
import { HowItWorks, Finance, Members, Trust, FAQ } from "@/components/home/Sections";
import styles from "@/components/home/home.module.css";

export const metadata: Metadata = {
  title: "Uranova | Seu conhecimento, seu negócio digital",
  description: "Organize seus cursos e produtos digitais, acompanhe suas vendas e entregue conteúdo aos compradores com a Uranova.",
};

export default function HomePage() {
  return <div className={styles.home}>
    <Hero /><TrustBar /><Products /><HowItWorks /><Finance /><Members /><Trust /><FAQ /><CTA />
  </div>;
}
