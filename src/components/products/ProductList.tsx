type Product = {
  id: string;
  title: string;
  image_url: string | null;
  product_type: string | null;
  is_marketplace: boolean;
  status: string;
  price: string;
  checkout_slug: string;
};

interface Props {
  products: Product[];
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export default function ProductList({
  products,
  editProduct,
  deleteProduct,
}: Props) {
  return (
    <div className="mt-14">

      <h2 className="text-2xl md:text-3xl font-bold mb-8">
        📦 Meus Produtos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="
              bg-zinc-900
              border
              border-zinc-800
              hover:border-green-500/30
              transition-all
              rounded-3xl
              p-4 md:p-8
            "
          >

            <img
              src={product.image_url || "/logo.png"}
              alt={product.title}
              className="
                w-full
                h-56
                object-cover
                rounded-2xl
              "
            />

            <div className="p-5">

              <h3 className="text-xl font-bold">
                {product.title}
              </h3>

              <div className="flex flex-wrap gap-2 mt-3">

                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-blue-500/10
                    text-blue-400
                    text-xs
                    font-bold
                  "
                >
                  {product.product_type}
                </span>

                {product.is_marketplace && (
                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-purple-500/10
                      text-purple-400
                      text-xs
                      font-bold
                    "
                  >
                    Marketplace
                  </span>
                )}

              </div>

              <div
                className="
                  inline-flex
                  mt-3
                  px-3
                  py-1
                  rounded-full
                  bg-green-500/10
                  text-green-400
                  text-xs
                  font-bold
                "
              >
                ● {product.status}
              </div>

              <p className="text-green-400 text-2xl md:text-3xl font-black mt-4">
                R$ {product.price}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  onClick={() => editProduct(product)}
                  className="flex-1 bg-blue-500 hover:bg-blue-400 text-black py-3 rounded-2xl font-semibold"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-black py-3 rounded-2xl font-semibold"
                >
                  Excluir
                </button>

              </div>

              <a
                href={`/checkout/product/${product.checkout_slug}`}
                target="_blank"
                className="
                  mt-4
                  block
                  text-center
                  bg-green-500
                  hover:bg-green-400
                  text-black
                  py-3
                  rounded-2xl
                  font-bold
                "
              >
                Abrir Página 🚀
              </a>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}