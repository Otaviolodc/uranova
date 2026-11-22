import Link from "next/link";
import { Check, ChevronDown, BookOpen, FileText, FolderOpen, LockKeyhole, Eye, ListChecks, Play } from "lucide-react";
import SectionHeading from "./SectionHeading";
import styles from "./home.module.css";

export function HowItWorks() {
  return <section id="como-funciona" className={styles.band}><div className={`${styles.container} ${styles.section}`}>
    <SectionHeading eyebrow="COMO FUNCIONA" title="Da sua ideia ao seu espaço digital.">Três etapas para construir sua presença na plataforma.</SectionHeading>
    <ol className={styles.steps}>{[
      ["Crie sua conta", "Comece pelo cadastro e complete as informações do seu perfil."],
      ["Prepare seu produto", "Cadastre seu conteúdo, organize a entrega e configure os dados necessários para vender."],
      ["Compartilhe e acompanhe", "Divulgue sua página e consulte os pedidos e acessos no painel."],
    ].map(([title, text], index) => <li key={title}><span className={styles.stepNumber}>0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
  </div></section>;
}

export function Finance() {
  return <section id="financeiro" className={`${styles.container} ${styles.section} ${styles.split}`}>
    <div><SectionHeading eyebrow="VENDAS E FINANCEIRO" title="Mais clareza sobre cada movimento.">Acompanhe vendas brutas, taxas, valores líquidos e o histórico de saques em uma visão organizada.</SectionHeading>
      <ul className={styles.checkList}>{["Consulte o histórico de pedidos e vendas.", "Diferencie valores disponíveis e pendentes.", "Acompanhe o andamento dos saques."].map(text => <li key={text}><Check size={18} aria-hidden="true" />{text}</li>)}</ul>
      <p className={styles.smallNote}>Disponibilidade de valores e saques depende da configuração da conta, da verificação dos pagamentos e das regras aplicáveis.</p>
    </div>
    <figure className={styles.financePreview}><div className={styles.panelHeading}><h3>Uma visão do financeiro</h3><span className={styles.demoLabel}>Exemplo</span></div><div className={styles.financeTotal}><span>Vendas brutas</span><strong>R$ 8.400,00</strong><span>Valores fictícios para demonstração</span></div><dl className={styles.financeRows}><div><dt>Disponível conciliado</dt><dd>R$ 5.200,00</dd></div><div><dt>Saldo pendente</dt><dd>R$ 2.100,00</dd></div><div><dt>Saques em andamento</dt><dd>R$ 600,00</dd></div></dl><figcaption>Ilustração de indicadores independentes. Não representa uma conta real nem uma simulação de taxas.</figcaption></figure>
  </section>;
}

export function Members() {
  return <section id="produtos" className={styles.band}><div className={`${styles.container} ${styles.section} ${styles.split}`}>
    <figure className={styles.coursePreview}><div className={styles.panelHeading}><span className={styles.wordmark}>Seu espaço de conteúdo</span><span className={styles.demoLabel}>Exemplo</span></div><div className={styles.courseCover}><BookOpen size={38} strokeWidth={1.3} aria-hidden="true" /><span>DO CONHECIMENTO À PRÁTICA</span><strong>Sua próxima<br />grande ideia.</strong><span>Curso demonstrativo</span></div><div className={styles.lesson}><span className={styles.iconBox}><Play size={17} aria-hidden="true" /></span><div><strong>Um começo para aprender</strong><span>Módulo ilustrativo · Aula de exemplo</span></div></div><figcaption>Apresentação ilustrativa da experiência de conteúdo.</figcaption></figure>
    <div id="membros"><SectionHeading eyebrow="PRODUTOS DIGITAIS E ÁREA DE MEMBROS" title="Um lugar para ensinar. Outro motivo para voltar.">Organize seu conteúdo e ofereça aos compradores um espaço para encontrar os produtos aos quais têm acesso.</SectionHeading><div className={styles.productTypes}>{[{ Icon: BookOpen, title: "Cursos", text: "Módulos, aulas e acompanhamento de conclusão." }, { Icon: FileText, title: "E-books e PDFs", text: "Materiais digitais reunidos na biblioteca do comprador." }, { Icon: FolderOpen, title: "Arquivos digitais", text: "Conteúdos para download conforme o acesso ao produto." }].map(({ Icon, title, text }) => <div key={title}><Icon size={21} aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></div>
  </div></section>;
}

export function Trust() {
  return <section id="confianca" className={`${styles.container} ${styles.section}`}><SectionHeading eyebrow="CONFIANÇA SE CONSTRÓI COM CLAREZA" title="Informação acessível. Acesso com controle.">Conheça as políticas e os critérios de acesso antes de começar.</SectionHeading><div className={styles.trustGrid}>{[
    { Icon: LockKeyhole, title: "Conteúdo com acesso verificado", text: "A área de cursos verifica a conta e o acesso ativo ao produto antes de exibir as aulas." },
    { Icon: Eye, title: "Privacidade documentada", text: "Consulte como o tratamento de dados é descrito na nossa política.", href: "/privacy", label: "Ler política de privacidade" },
    { Icon: ListChecks, title: "Regras para consultar", text: "Termos de uso e política de reembolso estão disponíveis publicamente.", href: "/refund", label: "Consultar reembolsos" },
  ].map(({ Icon, title, text, href, label }) => <article key={title}><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{text}</p>{href && <Link className={styles.textLink} href={href}>{label}</Link>}</article>)}</div></section>;
}

const questions = [
  ["O que posso organizar na Uranova?", "Você pode cadastrar cursos, e-books, PDFs e arquivos digitais. Nos cursos, o conteúdo pode ser organizado em módulos e aulas. A entrega depende do conteúdo e das configurações de cada produto."],
  ["Como meus alunos acessam o conteúdo?", "Após entrar na conta, o comprador encontra os produtos disponíveis em sua biblioteca. O acesso às aulas depende de um acesso ativo e válido ao curso."],
  ["O que preciso fazer antes de vender?", "Crie sua conta, complete o perfil, cadastre o produto e configure os dados de pagamento solicitados no painel. A disponibilidade para vender depende da conclusão dessas configurações e verificações."],
  ["Os números mostrados nesta página são reais?", "Não. Todas as prévias desta página são demonstrativas. Nomes, gráficos e valores são fictícios e não representam resultados de clientes, projeções de receita ou garantias de ganhos."],
  ["Onde vejo taxas e valores disponíveis?", "A área Financeiro apresenta vendas brutas, taxas, valores líquidos e saldos. Os valores disponíveis para saque dependem da verificação e conciliação dos pagamentos e das regras aplicáveis à conta."],
  ["Como posso tirar outras dúvidas?", <>Acesse a <Link href="/contact">página de contato</Link> para consultar o canal de atendimento. Você também pode ler os <Link href="/terms">termos de uso</Link> e a <Link href="/refund">política de reembolso</Link>.</>],
];

export function FAQ() {
  return <section id="faq" className={styles.band}><div className={`${styles.container} ${styles.section} ${styles.faqLayout}`}><SectionHeading eyebrow="PERGUNTAS FREQUENTES" title="Tudo começa com uma boa pergunta.">Algumas respostas para ajudar no seu próximo passo.</SectionHeading><div className={styles.faq}>{questions.map(([question, answer], index) => <details key={index}><summary>{question}<ChevronDown size={19} aria-hidden="true" /></summary><div className={styles.answer}>{answer}</div></details>)}</div></div></section>;
}
