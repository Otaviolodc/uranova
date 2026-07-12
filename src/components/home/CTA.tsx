import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-32 px-6">

      <div className="max-w-6xl mx-auto">

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-[40px] p-20 text-center shadow-2xl shadow-green-500/20">

          <h2 className="text-5xl font-bold">
            Comece gratuitamente
          </h2>

          <p className="mt-6 text-green-50">
            Crie sua conta e centralize todo o seu negócio digital.
          </p>

          <Link
            href="/auth/login"
            className="inline-block mt-10 bg-white text-black px-8 py-4 rounded-2xl font-bold"
          >
            Criar Conta
          </Link>

        </div>

      </div>

    </section>
  );
}