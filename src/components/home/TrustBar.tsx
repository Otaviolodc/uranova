import { BookOpen, Package, ChartNoAxesCombined, Wallet } from "lucide-react";
import styles from "./home.module.css";

export default function TrustBar() {
  return <div className={styles.capabilities}><div className={styles.container}>
    <p>Uma estrutura.<br /><strong>Mais possibilidades.</strong></p>
    {[{ Icon: BookOpen, text: "Cursos online" }, { Icon: Package, text: "Produtos digitais" }, { Icon: ChartNoAxesCombined, text: "Acompanhamento de vendas" }, { Icon: Wallet, text: "Visão financeira" }].map(({ Icon, text }) => <span key={text}><Icon size={20} aria-hidden="true" />{text}</span>)}
  </div></div>;
}
