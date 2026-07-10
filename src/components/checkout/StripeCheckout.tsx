"use client";

import { useState } from "react";

interface StripeCheckoutProps {
  checkoutSlug: string;
}

export default function StripeCheckout({
  checkoutSlug,
}: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/stripe/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            checkoutSlug,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Erro ao iniciar pagamento.");
        return;
      }

      if (!data.url) {
        alert("Checkout indisponível.");
        return;
      }

      window.location.href = data.url;

    } catch (error) {

      console.error(error);

      alert("Erro ao conectar com Stripe.");

    } finally {

      setLoading(false);

    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="
        w-full
        bg-green-500
        hover:bg-green-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        text-black
        font-bold
        py-4
        rounded-xl
        transition
      "
    >
      {loading
        ? "Redirecionando..."
        : "Comprar Agora"}
    </button>
  );
}