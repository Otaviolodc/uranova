import PixCheckout from "@/components/checkout/PixCheckout"

export default function CheckoutPage() {

  return (

    <main
      className="
        min-h-screen
        flex
        items-center
        justify-center
        p-6
      "
    >

      <PixCheckout
        price={19.90}
        userId="teste"
      />

    </main>

  )

}