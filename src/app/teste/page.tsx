"use client";

import { supabase }
from "@/lib/supabase/client";

export default function TestePage() {
  async function createProduct() {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "iPhone 15 Pro Max",
          price: "5999",
          image_url:
            "https://i.imgur.com/1.jpg",
          affiliate_url:
            "https://google.com",
          marketplace: "Amazon",
        }),
      });

      const data = await response.json();

      console.log(data);

      alert("Produto criado!");
    } catch (error) {
      console.log(error);

      alert("Erro ao criar produto");
    }
  }

  return (
    <div className="p-10">
      <button
        onClick={createProduct}
        className="bg-green-500 text-white p-4 rounded"
      >
        Criar Produto
      </button>
    </div>
  );
}