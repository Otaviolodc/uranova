"use client"

import { supabase }
from "@/lib/supabase/client";
import { useState } from "react"
import Image from "next/image"

export default function PixCheckout() {

  const [loading, setLoading] = useState(false)

  const [pixCode, setPixCode] = useState("")

  const [qrCode, setQrCode] = useState("")

  async function handleCheckout() {

    try {

      setLoading(true)

      const response = await fetch("/api/asaas/create-payment", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: "Luis",
          email: "teste@gmail.com",
          cpfCnpj: "12345678909",
          value: 19.90,
          userId: "123",
        }),
      })

      if (!response.ok) {

        alert("Erro ao gerar pagamento")

        return

      }

      const data = await response.json()



      if (data.encodedImage) {

        setQrCode(
          `data:image/png;base64,${data.encodedImage}`
        )

      }

      if (data.payload) {

        setPixCode(data.payload)

      }

    } catch (error) {

      console.error(
        "PIX CHECKOUT ERROR:",
         error
      )

      alert("Erro ao gerar PIX")

    } finally {

      setLoading(false)

    }

  }

  async function copyPix() {

    if (!pixCode) return

    await navigator.clipboard.writeText(pixCode)

    alert("PIX copiado!")

  }

  return (

    <div className="flex flex-col items-center gap-4">

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="border px-4 py-2 rounded"
      >
        {loading ? "Gerando..." : "Comprar Agora"}
      </button>

      {qrCode && (

        <>
          <Image
            src={qrCode}
            alt="QR Code PIX"
            width={256}
            height={256}
            unoptimized
            className="w-64 h-64 bg-white p-2 rounded"
          />

          <textarea
            value={pixCode}
            readOnly
            className="
              w-64
              h-24
              text-black
              p-2
              rounded
              resize-none
            "
          />

          <button
            onClick={copyPix}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Copiar PIX
          </button>
        </>

      )}

    </div>

  )

}