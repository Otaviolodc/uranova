"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "@/components/home/home.module.css";

const links = [["/#recursos", "Recursos"], ["/#como-funciona", "Como funciona"], ["/#membros", "Área de membros"], ["/#faq", "FAQ"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return <header className={styles.header} onKeyDown={event => {
    if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
  }}>
    <a className={styles.skipLink} href="#conteudo">Pular para o conteúdo</a>
    <div className={`${styles.container} ${styles.headerInner}`}>
      <Link href="/" aria-label="Uranova — início" className={styles.logo}>uranova<span aria-hidden="true">.</span></Link>
      <nav className={styles.desktopNav} aria-label="Navegação principal">{links.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav>
      <div className={styles.headerActions}><Link href="/auth/login" prefetch={false} className={styles.login}>Entrar</Link><Link href="/auth/signup" prefetch={false} className={`${styles.primary} ${styles.headerSignup}`}>Criar conta</Link><button ref={toggle} className={styles.menuToggle} aria-expanded={open} aria-controls="navegacao-movel" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
    </div>
    <nav id="navegacao-movel" hidden={!open} className={`${styles.mobileNav} ${styles.container}`} aria-label="Navegação móvel">{links.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/auth/signup" prefetch={false} onClick={() => setOpen(false)}>Criar minha conta</Link></nav>
  </header>;
}
