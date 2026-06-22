interface Props {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
}

export default function ProductPreview({
  title,
  description,
  price,
  imageUrl,
}: Props) {
  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-4 md:p-8
        xl:sticky
        xl:top-8
        h-fit
      "
    >
      <h2 className="text-2xl font-bold mb-6">
        👀 Preview
      </h2>

      <div className="bg-zinc-800 rounded-2xl overflow-hidden">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || "Imagem do produto"}
            className="
              w-full
              h-52 md:h-72
              object-cover
            "
          />
        ) : (
          <div
            className="
              h-72
              flex
              items-center
              justify-center
              text-zinc-500
            "
          >
            Sem imagem
          </div>
        )}

      </div>

      <h3 className="text-xl md:text-2xl font-black mt-6 break-words">
        {title || "Seu produto"}
      </h3>

      <p className="text-zinc-400 mt-3">
        {description || "A descrição aparecerá aqui."}
      </p>

      <p className="text-2xl md:text-4xl font-black text-green-400 mt-6">
        R$ {price || "0,00"}
      </p>

      <button
        type="button"
        className="
          mt-6
          w-full
          bg-gradient-to-r
          from-green-500
          to-emerald-400
          text-black
          py-4
          rounded-2xl
          font-black
        "
      >
        Comprar Agora
      </button>

    </div>
  );
}