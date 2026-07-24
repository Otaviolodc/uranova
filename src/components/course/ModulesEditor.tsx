"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LessonEditor from "./LessonEditor";

export default function ModulesEditor() {
  const { id } = useParams<{ id: string }>();

  const [modules, setModules] = useState<any[]>([]);

  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");

async function fetchModules() {

  const response = await fetch(
    `/api/course-modules?courseId=${id}`
  );

  if (!response.ok) return;

  const data = await response.json();

  setModules(data);

}
  useEffect(() => {
    if (id) {
      fetchModules();
    }
  }, [id]);

async function createModule() {

  if (!title.trim()) return;

  const response = await fetch(
    "/api/course-modules",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        courseId: id,
        title,
        description: "",
        position: modules.length,
      }),
    }
  );

  if (!response.ok) {

  const error = await response.json();

  console.error(error);

  alert(error.error ?? "Erro ao criar módulo.");

  return;

}

  setTitle("");

  setCreating(false);

  fetchModules();

}

  return (
    <div className="space-y-6">

      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="
            bg-green-500
            hover:bg-green-400
            text-black
            px-5
            py-3
            rounded-xl
            font-bold
          "
        >
          ➕ Novo Módulo
        </button>
      )}

      {creating && (
        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900
            p-6
            space-y-4
          "
        >
          <h2 className="text-xl font-bold">
            Novo Módulo
          </h2>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Ex.: Módulo 1 - Introdução"
            className="
              w-full
              bg-zinc-800
              rounded-xl
              p-4
            "
          />

          <div className="flex gap-3">

            <button
              onClick={createModule}
              className="
                bg-green-500
                hover:bg-green-400
                text-black
                px-5
                py-3
                rounded-xl
                font-bold
              "
            >
              Salvar
            </button>

            <button
              onClick={() => {
                setCreating(false);
                setTitle("");
              }}
              className="
                bg-zinc-800
                hover:bg-zinc-700
                px-5
                py-3
                rounded-xl
              "
            >
              Cancelar
            </button>

          </div>

        </div>
      )}

      <div
        className="
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
          p-6
        "
      >
        {modules.length === 0 ? (

  <p>
    📚 Nenhum módulo criado.
  </p>

) : (

  <div className="space-y-4">

    {modules.map((module) => (

  <div
    key={module.id}
    className="
      bg-zinc-800
      rounded-2xl
      p-6
      space-y-4
    "
  >

    <div className="flex justify-between items-center">

      <h2 className="font-bold text-lg">
        📚 {module.title}
      </h2>

    </div>

      <LessonEditor moduleId={module.id} />

  </div>

))}

  </div>

)}
      </div>

    </div>
  );
}