import Link from "next/link";
import styles from "./home.module.css";

export default function CTA() {
  return <section className={`${styles.container} ${styles.ctaSection}`}>
    <div className={styles.cta}><div><p className={styles.eyebrow}>SEU PRÓXIMO CAPÍTULO</p><h2>O conhecimento é seu.<br />O próximo passo também.</h2><p>Dê uma nova forma ao que você tem para compartilhar.</p></div><div className={styles.ctaActions}><Link href="/auth/signup" prefetch={false} className={styles.primary}>Criar minha conta</Link><Link href="/contact" className={styles.textLink}>Falar com a Uranova</Link></div></div>
  </section>;
}
