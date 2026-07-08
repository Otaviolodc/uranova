import ProductDownload from "./ProductDownload";
import ProductVideo from "./ProductVideo";
import ProductEbook from "./ProductEbook";
import ProductMentoring from "./ProductMentoring";

interface Props {
  productType: string;
}

export default function ProductViewer({
  productType,
}: Props) {

  switch (productType) {

    case "pdf":
      return <ProductDownload />;

    case "ebook":
      return <ProductEbook />;

    case "curso":
      return <ProductVideo />;

    case "mentoria":
      return <ProductMentoring />;

    default:
      return (
        <div
          className="
            mt-10
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-8
          "
        >
          Tipo de produto não suportado.
        </div>
      );

  }

}