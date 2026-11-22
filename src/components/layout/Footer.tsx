import Link from "next/link";
import styles from "@/components/home/home.module.css";

const groups = [
  { title: "Plataforma", links: [["/#recursos", "Recursos"], ["/#produtos", "Produtos digitais"], ["/#membros", "Área de membros"], ["/#financeiro", "Vendas e financeiro"]] },
  { title: "Uranova", links: [["/about", "Sobre nós"], ["/contact", "Contato"], ["/#faq", "Dúvidas frequentes"]] },
  { title: "Informações legais", links: [["/terms", "Termos de uso"], ["/privacy", "Privacidade"], ["/refund", "Política de reembolso"]] },
];

export default function Footer() {
  return <footer className={styles.footer}><div className={styles.container}><div className={styles.footerGrid}><div><Link href="/" className={styles.logo} aria-label="Uranova — início">uranova<span aria-hidden="true">.</span></Link><p>Conhecimento que conecta.<br />Um novo espaço para o seu negócio digital.</p></div>{groups.map(group => <nav key={group.title} aria-label={group.title}><h2>{group.title}</h2><ul>{group.links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>)}</div><div className={styles.footerBottom}><p>© {new Date().getFullYear()} Uranova. Todos os direitos reservados.</p><span>Feita para quem compartilha conhecimento.</span></div></div></footer>;
}
