import "./globals.css";

export const metadata = {
  title: "Uranova",
  description: "Plataforma inteligente de marketing, automação e vendas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-100 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}