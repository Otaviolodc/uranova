import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Uranova - Plataforma Completa para Criadores Digitais",
  description:
    "Venda cursos, e-books, mentorias, assinaturas e gerencie sua audiência em uma única plataforma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}