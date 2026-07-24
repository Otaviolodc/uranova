"use client";

import { useState } from "react";

import type { Product } from "@/types/product";

const emptyProduct: Product = {
  id: "",
  product_id: "",
  user_id: "",

  title: "",
  description: null,

  price: "",

  image_url: null,

  file_path: null,

  affiliate_url: null,

  type: "pdf",

  is_marketplace: false,

  checkout_slug: "",

  status: "active",

  created_at: "",

  updated_at: null,
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const [product, setProduct] =
    useState<Product>(emptyProduct);

  const [loading, setLoading] =
    useState(false);

  function updateField<K extends keyof Product>(
    field: K,
    value: Product[K]
  ) {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetProduct() {
    setProduct(emptyProduct);
  }

  return {
    product,
    setProduct,

    products,
    setProducts,

    loading,
    setLoading,

    updateField,

    resetProduct,
  };
}