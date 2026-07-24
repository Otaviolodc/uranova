export type Product = {
  id: string;

  product_id: string;

  user_id: string;

  title: string;

  description: string | null;

  price: string;

  image_url: string | null;

  file_path: string | null;

  affiliate_url: string | null;

  type:
    | "course"
    | "pdf"
    | "ebook"
    | "mentoring"
    | "bundle";

  is_marketplace: boolean;

  checkout_slug: string;

  status: string;

  created_at: string;

  updated_at: string | null;
};