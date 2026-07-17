import ModulesEditor from "@/components/course/ModulesEditor";

export default function CourseEditorPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-2">
        Editor da Área de Membros
      </h1>

      <p className="text-zinc-400 mb-8">
        Organize módulos, aulas e materiais.
      </p>

      <ModulesEditor />

    </div>
  );
}