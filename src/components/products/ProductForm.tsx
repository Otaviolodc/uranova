import type { Product } from "@/types/product";

interface Props {
  product: Product;

  updateField: <K extends keyof Product>(
    field: K,
    value: Product[K]
  ) => void;

  loading: boolean;

  editingId: string | null;

  handleUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleProductFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  handleCreate: () => void;
}
export default function ProductForm({
  product,
  updateField,
  loading,
  editingId,
  handleUpload,
  handleProductFileUpload,
  handleCreate,
}: Props) {
  
  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-4 md:p-8
      "
    >
      <h2 className="text-2xl font-bold mb-6">
        Novo Produto
      </h2>

    <div className="space-y-2 mb-6">

  <label className="text-sm text-zinc-400">
    Tipo do Produto
  </label>

  <select
    value={product.type}
    onChange={(e) =>
      updateField(
        "type",
        e.target.value as Product["type"]
      )
    }
    className="
      w-full
      bg-zinc-800
      border
      border-zinc-700
      rounded-2xl
      p-4
      focus:border-green-500
      outline-none
    "
  >
    <option value="course">
      📚 Curso
    </option>

    <option value="pdf">
      📄 PDF
    </option>

    <option value="ebook">
      📘 E-book
    </option>

    <option value="mentoring">
      🎥 Mentoria
    </option>

    <option value="bundle">
      📦 Pack de Arquivos
    </option>

  </select>

</div>

      <div className="space-y-4">

        <input
          placeholder="Título"
          value={product.title}
          onChange={(e) =>
            updateField(
              "title",
              e.target.value
            )
          }
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <textarea
          placeholder="Descrição"
          value={product.description ?? ""}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
          className="w-full bg-zinc-800 p-4 rounded-2xl h-32"
        />

        <input
          placeholder="Preço"
          value={product.price}
          onChange={(e) =>
            updateField(
              "price",
              e.target.value
            )
          }
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <input
          placeholder="Link de Venda"
          value={product.affiliate_url ?? ""}
          onChange={(e) =>
            updateField(
              "affiliate_url",
              e.target.value
            )
          }
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={product.is_marketplace}
            onChange={(e) =>
              updateField(
                "is_marketplace",
                e.target.checked
              )
            }
          />
          Publicar no Marketplace
        </label>

        <label
          className="
            border-2
            border-dashed
            border-zinc-700
            rounded-2xl
            p-8
            flex
            justify-center
            items-center
            cursor-pointer
          "
        >
          📸 Upload da capa

          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        {(product.type === "pdf" || product.type === "ebook") && (

  <label
    className="
      border-2
      border-dashed
      border-zinc-700
      rounded-2xl
      p-8
      flex
      justify-center
      items-center
      cursor-pointer
    "
  >
    {product.type === "pdf"
      ? "📄 Enviar Produto PDF"
      : "📘 Enviar E-book"}

    <input
      type="file"
      accept=".pdf,.epub"
      onChange={handleProductFileUpload}
      className="hidden"
    />
  </label>

)}

{product.type === "course" && (

  <div
    className="
      rounded-2xl
      border
      border-green-500/30
      bg-green-500/10
      p-6
      text-center
    "
  >
    <h3 className="font-bold text-green-400">
      📚 Área de Membros
    </h3>

    <p className="text-zinc-400 mt-2">
      Depois de criar o produto,
      você poderá adicionar módulos,
      aulas e vídeos.
    </p>

  </div>

)}

{product.type === "mentoring" && (

  <div
    className="
      rounded-2xl
      border
      border-blue-500/30
      bg-blue-500/10
      p-6
      text-center
    "
  >
    <h3 className="font-bold text-blue-400">
      🎥 Mentoria
    </h3>

    <p className="text-zinc-400 mt-2">
      Depois de criar o produto,
      configure datas,
      horários e links das reuniões.
    </p>

  </div>

)}

{product.type === "bundle" && (

  <div
    className="
      rounded-2xl
      border
      border-orange-500/30
      bg-orange-500/10
      p-6
      text-center
    "
  >
    <h3 className="font-bold text-orange-400">
      📦 Pack de Arquivos
    </h3>

    <p className="text-zinc-400 mt-2">
      Após salvar,
      será possível enviar
      vários arquivos.
    </p>

  </div>

)}

{product.type === "ebook" && (
  <div
    className="
      bg-blue-950/40
      border
      border-blue-700
      rounded-2xl
      p-6
      text-center
    "
  >
    <h3 className="text-blue-400 font-bold">
      📘 E-book
    </h3>

    <p className="text-zinc-400 mt-2">
      Após criar o produto, envie a versão final do seu e-book.
    </p>
  </div>
)}

        {product.file_path && (
          <p className="text-green-400 text-sm break-all">
            📄 {product.file_path}
          </p>
        )}

        {product.image_url && (
          <img
            src={product.image_url}
            alt="Capa do produto"
            className="w-48 rounded-2xl"
          />
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="
            w-full
            bg-green-500
            hover:bg-green-400
            text-black
            py-4
            rounded-2xl
            font-bold
          "
        >
          {loading
            ? "Salvando..."
            : editingId
            ? "Atualizar Produto ✅"
            : "Criar Produto 🚀"}
        </button>

      </div>
    </div>
  );
}