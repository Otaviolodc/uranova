export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-24">

      <h1 className="text-5xl font-bold mb-12 text-white">
        Sobre a Uranova
      </h1>

      <div className="space-y-8 text-lg leading-9 text-zinc-300">

        <p>
          A Uranova é uma plataforma brasileira desenvolvida para ajudar
          produtores digitais a vender cursos online, e-books, mentorias,
          assinaturas e outros produtos digitais de forma simples, segura e
          profissional.
        </p>

        <p>
          Nossa missão é oferecer uma estrutura completa para que criadores de
          conteúdo possam gerenciar seus produtos, processar pagamentos,
          acompanhar vendas e entregar conteúdo aos seus clientes em um único
          lugar.
        </p>

        <p>
          A plataforma reúne recursos como checkout seguro, área de membros,
          marketplace, páginas de links, gerenciamento financeiro, sistema de
          afiliados e ferramentas voltadas ao crescimento de negócios digitais.
        </p>

        <p>
          Trabalhamos continuamente para oferecer uma experiência confiável
          tanto para produtores quanto para compradores, utilizando tecnologias
          modernas e parceiros reconhecidos internacionalmente para o
          processamento de pagamentos.
        </p>

      </div>

      <hr className="border-zinc-800 my-12" />

      <div className="space-y-3 text-zinc-400">

        <h2 className="text-xl font-semibold text-white mb-4">
          Informações da Empresa
        </h2>

        <p>
          <strong className="text-white">Empresa:</strong> Uranova
        </p>

        <p>
          <strong className="text-white">Segmento:</strong> Plataforma para venda de produtos digitais.
        </p>

        <p>
          <strong className="text-white">Localização:</strong> Brasil
        </p>

        <p>
          <strong className="text-white">Site Oficial:</strong>{" "}
          <a
            href="https://www.uranova.com.br"
            className="text-green-400 hover:text-green-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.uranova.com.br
          </a>
        </p>

        <p>
          <strong className="text-white">Contato:</strong>{" "}
          contato@uranova.com.br
        </p>

        <p className="text-sm text-zinc-500 pt-4">
          O CNPJ será exibido nesta página após a formalização da empresa.
        </p>

      </div>

    </main>
  );
}