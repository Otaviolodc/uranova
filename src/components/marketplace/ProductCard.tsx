import Link from "next/link";

type ProductCardProps = {
  product: any;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <div
      className="
        group
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
        hover:border-green-500/30
        hover:-translate-y-2
        hover:shadow-2xl
        transition-all
        duration-300
      "
    >
      {/* IMAGEM */}
      <div className="relative">

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="
              w-full
              h-56
              object-cover
            "
          />
        ) : (
          <div
            className="
              h-56
              flex
              items-center
              justify-center
              text-6xl
            "
          >
            📦
          </div>
        )}

        {/* BADGES */}
        <div className="absolute top-4 left-4 flex gap-2">

          <div
            className="
              bg-green-500
              text-black
              px-3
              py-1
              rounded-full
              text-xs
              font-bold
            "
          >
            🔥 Destaque
          </div>

        </div>

      </div>

      {/* CONTEÚDO */}
      <div className="p-5">

        <div className="flex gap-2 mb-4">

          <span
            className="
              bg-blue-500/10
              text-blue-400
              px-3
              py-1
              rounded-full
              text-sm
            "
          >
            {product.product_type}
          </span>

          <span
            className="
              bg-zinc-800
              text-zinc-300
              px-3
              py-1
              rounded-full
              text-sm
            "
          >
            Produto Digital
          </span>

        </div>

        <h2
          className="
            text-2xl
            font-bold
            text-white
            line-clamp-2
          "
        >
          {product.title}
        </h2>

        <p className="text-zinc-500 mt-3">

          Marketplace Uranova

        </p>

        <h3
          className="
            text-green-400
            text-4xl
            font-black
            mt-6
          "
        >
          R$ {Number(product.price).toFixed(2)}
        </h3>

        <Link
          href={`/checkout/product/${product.checkout_slug}`}
          className="
            mt-6
            block
            w-full
            bg-gradient-to-r
            from-green-500
            to-emerald-400
            hover:scale-[1.02]
            transition-all
            duration-200
            shadow-lg
            shadow-green-500/20
            text-black
            text-center
            py-4
            rounded-2xl
            font-bold
          "
        >
          Ver Produto
        </Link>

      </div>

    </div>
  );
}