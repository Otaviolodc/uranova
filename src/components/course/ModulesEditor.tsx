"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import LessonEditor from "./LessonEditor";
import { nextPosition, orderCourseItems } from "@/lib/courses";
type Module = { id: string; title: string; position: number | null };
export default function ModulesEditor() {
  const { id } = useParams<{ id: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState("");
  const fetchModules = useCallback(async () => {

    try {
      const response = await fetch(`/api/course-modules?courseId=${id}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error();
      setModules(orderCourseItems(data)); setError("");
    } catch { setError("Não foi possível carregar os módulos. Tente novamente."); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => {
    // State updates in this loader follow the network response/error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) void fetchModules();
  }, [id, fetchModules]);
  async function createModule() {
    if (!title.trim() || busy.current || loading || error) return;
    busy.current = true; setSaving(true);
    try {
      const response = await fetch("/api/course-modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: id, title, description: "", position: nextPosition(modules) }) });
      if (!response.ok) throw new Error();
      setTitle(""); await fetchModules();
    } catch { setError("Não foi possível confirmar a criação. Atualize a lista antes de tentar novamente."); }
    finally { busy.current = false; setSaving(false); }
  }
  return <section className="space-y-6">
    <div className="rounded-2xl border border-zinc-800 p-5 space-y-4">
      <label className="block">Novo módulo<input aria-label="Título do módulo" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} className="block w-full rounded-xl bg-zinc-800 p-4 mt-2" /></label>
      <button disabled={saving || loading || !!error || !title.trim()} onClick={createModule} className="rounded-xl bg-green-600 px-5 py-3 disabled:opacity-50">{saving ? "Salvando..." : "Criar módulo"}</button>
    </div>
    {loading && <p role="status">Carregando módulos...</p>}
    {error && <p role="alert">{error} <button onClick={fetchModules}>Atualizar lista</button></p>}
    {!loading && !error && !modules.length && <p>Nenhum módulo criado.</p>}
    {!error && modules.map(module => <section key={module.id} className="rounded-2xl bg-zinc-900 p-4 sm:p-6"><h2 className="text-lg font-bold mb-4">{module.title}</h2><LessonEditor moduleId={module.id} /></section>)}
  </section>;
}
