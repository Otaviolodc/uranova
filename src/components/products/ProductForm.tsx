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

        <select
          value={product.product_type}
          onChange={(e) =>
            updateField(
              "product_type",
              e.target.value
            )
          }
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        >
          <option value="ebook">Ebook</option>
          <option value="curso">Curso</option>
          <option value="pdf">PDF</option>
          <option value="ferramenta">Ferramenta</option>
          <option value="mentoria">Mentoria</option>
        </select>

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
          📄 Enviar Produto Digital

          <input
            type="file"
            accept=".pdf,.zip,.epub,.doc,.docx,.xls,.xlsx"
            onChange={handleProductFileUpload}
            className="hidden"
          />
        </label>

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