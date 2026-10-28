"use client";

import { useEffect, useRef, useState } from "react";
import { uploadProductFiles, type UploadKind } from "@/lib/products/upload";
import type { Product } from "@/types/product";

export function useProductUploads(updateField: <K extends keyof Product>(field: K, value: Product[K]) => void) {
  const active = useRef<AbortController | null>(null);
  const cache = useRef(new Map<File, string>());
  const mounted = useRef(true);
  const pending = useRef<{ files: File[]; kind: UploadKind } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); };
  }, []);

  async function upload(files: File[], kind: UploadKind) {
    if (active.current || !files.length) return;
    const controller = new AbortController();
    active.current = controller;
    pending.current = { files, kind };
    setUploading(true); setCanRetry(false); setMessage("Validando arquivos...");
    try {
      const value = await uploadProductFiles(files, kind, controller.signal, cache.current, (done, total) => {
        if (mounted.current) setMessage(`Arquivos confirmados: ${done}/${total}.`);
      });
      if (mounted.current && !controller.signal.aborted) {
        updateField(kind === "cover" ? "image_url" : "file_path", value);
        pending.current = null;
        setMessage("Upload concluído. Salve o produto para registrar a referência.");
      }
    } catch (error) {
      if (mounted.current) {
        setCanRetry(true);
        setMessage((controller.signal.aborted ? "Envio cancelado." : error instanceof Error ? error.message : "Falha no envio.")
          + " As referências anteriores foram preservadas. Arquivos já recebidos pelo servidor não foram apagados; um envio sem confirmação pode ter sido armazenado.");
      }
    } finally {
      active.current = null;
      if (mounted.current) setUploading(false);
    }
  }

  function clearDraft() {
    if (active.current) return;
    pending.current = null; cache.current.clear(); setCanRetry(false); setMessage("");
  }

  return {
    upload, uploading, message, canRetry, clearDraft,
    isUploading: () => active.current !== null,
    cancel: () => active.current?.abort(),
    retry: () => pending.current && upload(pending.current.files, pending.current.kind),
  };
}
