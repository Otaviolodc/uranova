import Link from "next/link";
import DashboardPreview from "./DashboardPreview";
import styles from "./home.module.css";

export default function Hero() {
  return <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
    <div className={styles.heroCopy}>
      <p className={styles.eyebrow}>PARA QUEM TRANSFORMA CONHECIMENTO</p>
      <h1 id="hero-title">O que você sabe<br />merece ir <span>mais longe.</span></h1>
      <p className={styles.lead}>Transforme seu conhecimento em um negócio digital. Seus produtos, suas vendas e a experiência dos seus alunos, conectados na Uranova.</p>
      <div className={styles.actions}>
        <Link className={styles.primary} href="/auth/signup" prefetch={false}>Criar minha conta</Link>
        <a className={styles.secondary} href="#demonstracao">Explorar a plataforma</a>
      </div>
      <p className={styles.heroNote}>Do primeiro conteúdo à gestão do seu negócio.</p>
    </div>
    <DashboardPreview />
  </section>;
}
