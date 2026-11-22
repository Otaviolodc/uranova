import type { ReactNode } from "react";
import styles from "./home.module.css";

export default function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className={styles.sectionHeading}><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
