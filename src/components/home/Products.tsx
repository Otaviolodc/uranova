import { BookOpen, ChartNoAxesCombined, PanelsTopLeft, Package } from "lucide-react";
import SectionHeading from "./SectionHeading";
import styles from "./home.module.css";

const resources = [
  { Icon: Package, title: "Seu catálogo, organizado", text: "Reúna cursos, e-books e arquivos digitais. Gerencie a apresentação dos seus produtos em um só lugar." },
  { Icon: BookOpen, title: "Conteúdo com continuidade", text: "Organize cursos em módulos e aulas para que seus alunos acompanhem o aprendizado." },
  { Icon: ChartNoAxesCombined, title: "Clareza para acompanhar", text: "Consulte pedidos e vendas e tenha uma visão dos valores do seu negócio." },
  { Icon: PanelsTopLeft, title: "Uma vitrine para compartilhar", text: "Apresente seus produtos na loja pública e reúna seus links em uma página de perfil." },
];

export default function Products() {
  return <section id="recursos" className={`${styles.container} ${styles.section}`}>
    <SectionHeading eyebrow="MENOS DISPERSÃO. MAIS DIREÇÃO." title="Seu talento cria. A Uranova conecta.">Uma base para organizar o que você vende, entregar o que ensina e acompanhar o que acontece.</SectionHeading>
    <div className={styles.featureGrid}>{resources.map(({ Icon, title, text }) => <article className={styles.featureCard} key={title}><span className={styles.iconBox}><Icon size={23} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}
