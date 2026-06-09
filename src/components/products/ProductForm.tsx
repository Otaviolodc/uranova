interface Props {
  title: string;
  description: string;
  price: string;
  affiliateUrl: string;
  productType: string;
  isMarketplace: boolean;
  imageUrl: string;
  loading: boolean;
  editingId: string | null;

  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setPrice: (value: string) => void;
  setAffiliateUrl: (value: string) => void;
  setProductType: (value: string) => void;
  setIsMarketplace: (value: boolean) => void;

  handleUpload: (e: any) => void;
  handleCreate: () => void;
}

export default function ProductForm({
  title,
  description,
  price,
  affiliateUrl,
  productType,
  isMarketplace,
  imageUrl,
  loading,
  editingId,
  setTitle,
  setDescription,
  setPrice,
  setAffiliateUrl,
  setProductType,
  setIsMarketplace,
  handleUpload,
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl h-32"
        />

        <input
          placeholder="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <input
          placeholder="Link de Venda"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          className="w-full bg-zinc-800 p-4 rounded-2xl"
        />

        <select
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
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
            checked={isMarketplace}
            onChange={(e) =>
              setIsMarketplace(e.target.checked)
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

        {imageUrl && (
          <img
            src={imageUrl}
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