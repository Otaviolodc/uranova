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
        border border-zinc-800
        rounded-3xl
        overflow-hidden
        xl:sticky
        xl:top-8
        h-fit
        shadow-2xl
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-5
          md:px-7
          md:py-6
          border-b
          border-zinc-800
        "
      >
        <div>
          <h2
            className="
              text-xl
              md:text-2xl
              font-black
              tracking-tight
              text-white
            "
          >
            Preview
          </h2>

          <p
            className="
              text-xs
              md:text-sm
              text-zinc-500
              mt-1
            "
          >
            Veja como seu produto será apresentado
          </p>
        </div>

        <span
          className="
            hidden
            sm:inline-flex
            items-center
            rounded-full
            bg-zinc-800
            border
            border-zinc-700
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-zinc-400
          "
        >
          Visão do cliente
        </span>
      </div>

      {/* PREVIEW CONTENT */}
      <div className="p-4 md:p-7">

        {/* IMAGE */}
        <div
          className="
            relative
            w-full
            aspect-[4/3]
            bg-zinc-950
            border
            border-zinc-800
            rounded-2xl
            overflow-hidden
            flex
            items-center
            justify-center
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || "Imagem do produto"}
              className="
                w-full
                h-full
                object-contain
                p-3
                md:p-5
              "
            />
          ) : (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-6
              "
            >
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-zinc-800
                  border
                  border-zinc-700
                  flex
                  items-center
                  justify-center
                  text-2xl
                  mb-4
                "
              >
                🖼️
              </div>

              <p className="text-zinc-500 text-sm font-medium">
                A capa do produto aparecerá aqui
              </p>
            </div>
          )}
        </div>

        {/* PRODUCT INFO */}
        <div className="mt-6">

          <h3
            className="
              text-xl
              md:text-2xl
              font-black
              tracking-tight
              text-white
              break-words
            "
          >
            {title || "Seu produto"}
          </h3>

          <p
            className="
              text-sm
              md:text-base
              text-zinc-400
              mt-3
              leading-relaxed
              break-words
            "
          >
            {description || "A descrição aparecerá aqui."}
          </p>

          {/* PRICE */}
          <div className="mt-6">
            <p
              className="
                text-xs
                uppercase
                tracking-wider
                font-bold
                text-zinc-500
              "
            >
              Por apenas
            </p>

            <p
              className="
                text-3xl
                md:text-4xl
                font-black
                text-green-400
                mt-1
                tracking-tight
              "
            >
              R$ {price || "0,00"}
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            className="
              mt-6
              w-full
              bg-gradient-to-r
              from-green-500
              to-emerald-400
              hover:from-green-400
              hover:to-emerald-300
              text-black
              py-4
              rounded-2xl
              font-black
              text-base
              transition-all
              duration-200
              hover:scale-[1.01]
              active:scale-[0.99]
              shadow-lg
              shadow-green-500/10
            "
          >
            Comprar Agora
          </button>

        </div>
      </div>
    </div>
  );
}