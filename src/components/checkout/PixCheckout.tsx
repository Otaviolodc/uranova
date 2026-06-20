"use client"

import { useState } from "react"
import Image from "next/image"

interface PixCheckoutProps {
  price: number;
  userId: string;
}

export default function PixCheckout({
  price,
  userId,
}: PixCheckoutProps) {

  const [loading, setLoading] = useState(false)

  const [pixCode, setPixCode] = useState("")

  const [qrCode, setQrCode] = useState("")

  const [localCouponCode, setLocalCouponCode] = useState("")

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [cpfCnpj, setCpfCnpj] = useState("")

  async function handleCheckout() {

  if (!name || !email || !cpfCnpj) {

    alert("Preencha todos os campos");

    return;

  }

  try {

    setLoading(true)

    const response = await fetch("/api/asaas/create-payment", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          cpfCnpj,
          value: price,
          userId,
          couponCode: localCouponCode,
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

  <div
    className="
      flex
      flex-col
      gap-4
      bg-zinc-900
      border
      border-zinc-800
      rounded-3xl
      p-6
      max-w-md
    "
  >

      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Nome completo"
        className="
          w-full
          bg-zinc-800
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-zinc-400
        "
      />

      <input
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        placeholder="E-mail"
        className="
          w-full
          bg-zinc-800
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-zinc-400
        "
      />

      <input
        value={cpfCnpj}
        onChange={(e) =>
          setCpfCnpj(e.target.value)
        }
        placeholder="CPF"
        className="
          w-full
          bg-zinc-800
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-zinc-400
        "
      />

      <input
        value={localCouponCode}
        onChange={(e) =>
          setLocalCouponCode(
            e.target.value.toUpperCase()
          )
        }
        placeholder="Cupom de desconto"
        className="
          w-full
          bg-zinc-800
          border
          border-zinc-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-zinc-400
        "
      />

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="
          w-full
          bg-green-500
          hover:bg-green-400
          text-black
          font-bold
          py-4
          rounded-xl
          transition
          shadow-lg
        "
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
            className="
              w-64
              h-64
              bg-white
              p-2
              rounded-xl
              mx-auto
            "
          />

          <textarea
            value={pixCode}
            readOnly
            className="
              w-full
              h-24
              bg-zinc-800
              border
              border-zinc-700
              text-white
              p-3
              rounded-xl
              resize-none
            "
          />

          <button
            onClick={copyPix}
            className="
              w-full
              bg-green-500
              hover:bg-green-400
              text-black
              font-bold
              py-3
              rounded-xl
              transition
            "
          >
            Copiar PIX
          </button>
        </>

      )}

    </div>

  )

}