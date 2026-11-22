import { ChartNoAxesCombined, LayoutDashboard, Package, Wallet, BookOpen } from "lucide-react";
import styles from "./home.module.css";

export default function DashboardPreview() {
  return <figure id="demonstracao" className={styles.preview} aria-label="Prévia ilustrativa do painel Uranova">
    <div className={styles.previewTop}><span className={styles.wordmark}>uranova</span><span className={styles.demoLabel}>Demonstração</span></div>
    <div className={styles.previewBody}>
      <div className={styles.previewRail} aria-hidden="true"><LayoutDashboard /><Package /><Wallet /><BookOpen /></div>
      <div className={styles.previewContent}>
        <div className={styles.previewHeading}><div><span className={styles.muted}>Seu negócio, em perspectiva</span><h2>Visão geral</h2></div><span className={styles.period}>Este mês</span></div>
        <div className={styles.metrics}>
          <div><span>Vendas brutas</span><strong>R$ 8.400<span>,00</span></strong></div>
          <div><span>Vendas verificadas</span><strong>42</strong></div>
        </div>
        <div className={styles.chart}>
          <div className={styles.chartHeading}><span>Visão de vendas</span><ChartNoAxesCombined size={18} /></div>
          <svg viewBox="0 0 480 156" role="img" aria-label="Gráfico ilustrativo de vendas, sem dados reais">
            <path d="M0 25H480 M0 70H480 M0 115H480" stroke="#2b302e" strokeDasharray="4 5" />
            <path d="M0 140L40 130L80 136L120 102L160 112L200 77L240 85L280 48L320 60L360 28L400 40L440 15L480 5V156H0Z" fill="#123b28" opacity=".55" />
            <path d="M0 140L40 130L80 136L120 102L160 112L200 77L240 85L280 48L320 60L360 28L400 40L440 15L480 5" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinejoin="round" />
          </svg>
          <div className={styles.chartAxis}><span>Início do mês</span><span>Fim do mês</span></div>
        </div>
        <div className={styles.previewProduct}><span className={styles.iconBox}><BookOpen size={20} /></span><div><strong>Seu próximo curso</strong><span>Conteúdo que ganha novos caminhos</span></div><span className={styles.productTag}>Curso</span></div>
      </div>
    </div>
    <figcaption>Prévia ilustrativa · Valores e conteúdos fictícios, sem promessa de resultados.</figcaption>
  </figure>;
}
