export default function ContactPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-24">

      <h1 className="text-5xl font-bold mb-10 text-white">
        Contato
      </h1>

      <div className="space-y-6 text-lg text-zinc-300 leading-8">

        <p>
          Caso tenha dúvidas sobre a plataforma Uranova, entre em contato
          através do e-mail abaixo.
        </p>

        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">

          <p>
            <strong className="text-white">E-mail:</strong><br />
            contato@uranova.com.br
          </p>

          <p className="mt-4">
            <strong className="text-white">Site:</strong><br />
            https://www.uranova.com.br
          </p>

          <p className="mt-4">
            <strong className="text-white">Horário de atendimento:</strong><br />
            Segunda a Sexta-feira, das 09:00 às 18:00 (Horário de Brasília).
          </p>

        </div>

      </div>

    </main>
  );
}