import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface Props {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: Props) {

  const { session_id } = await searchParams;

  return (

    <main className="min-h-screen bg-black flex items-center justify-center px-6">

      <div
        className="
          w-full
          max-w-xl
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-950
          p-10
          text-center
        "
      >

        <CheckCircle2
          className="mx-auto text-green-500"
          size={72}
        />

        <h1 className="mt-8 text-4xl font-bold text-white">

          Pagamento recebido!

        </h1>

        <p className="mt-5 text-zinc-400 leading-7">

          Recebemos sua compra com sucesso.

          <br />

          Estamos confirmando o pagamento junto à Stripe.

        </p>

        <p className="mt-4 text-zinc-500 text-sm">

          Assim que a confirmação for concluída, seu acesso será liberado automaticamente.

        </p>

        {session_id && (

          <div
            className="
              mt-8
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              p-4
              break-all
              text-xs
              text-zinc-500
            "
          >
            Sessão:

            <br />

            {session_id}

          </div>

        )}

        <Link
          href="/dashboard/customer/products"
          className="
            mt-10
            inline-flex
            items-center
            justify-center
            rounded-xl
            bg-green-500
            px-8
            py-4
            font-semibold
            text-black
            transition
            hover:bg-green-400
          "
        >
          Ir para Meus Produtos
        </Link>

      </div>

    </main>

  );

}