import {
  PlayCircle,
  FileText,
  Download,
  Lock,
  CheckCircle,
} from "lucide-react";

export default function MembersArea() {
  return (
    <section
      id="membros"
      className="py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* ESQUERDA */}
          <div>

            <span className="text-violet-400 font-medium">
              Área de membros profissional
            </span>

            <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              Entregue conteúdos premium
              para seus alunos.
            </h2>

            <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
              Organize cursos, mentorias, comunidades,
              aulas gravadas e materiais exclusivos em
              uma área de membros moderna e intuitiva.
            </p>

            <div className="mt-10 space-y-5">

              <Feature text="Vídeos organizados por módulos" />
              <Feature text="Upload de PDFs e materiais extras" />
              <Feature text="Liberação automática após compra" />
              <Feature text="Conteúdo protegido para alunos" />
              <Feature text="Experiência profissional em qualquer dispositivo" />

            </div>

          </div>

          {/* DIREITA */}
          <div
            className="
              glass
              rounded-[32px]
              p-8
              border
              border-white/5
              shadow-lg
              shadow-black/20
            "
          >

            <div className="border-b border-white/10 pb-6 mb-6">

              <h3 className="text-2xl font-bold">
                Curso de Marketing Digital
              </h3>

              <p className="text-zinc-400 mt-2">
                24 aulas • 8 módulos
              </p>

            </div>

            <div className="space-y-4">

              <Lesson
                icon={<PlayCircle size={20} />}
                title="Módulo 01 - Introdução"
                status="Concluído"
              />

              <Lesson
                icon={<PlayCircle size={20} />}
                title="Módulo 02 - Estratégias"
                status="Disponível"
              />

              <Lesson
                icon={<FileText size={20} />}
                title="Material Complementar PDF"
                status="Download"
              />

              <Lesson
                icon={<Download size={20} />}
                title="Arquivos Extras"
                status="Download"
              />

              <Lesson
                icon={<Lock size={20} />}
                title="Módulo Premium"
                status="Liberado após compra"
              />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <CheckCircle
        size={20}
        className="text-green-400"
      />

      <span className="text-zinc-200">
        {text}
      </span>

    </div>
  );
}

function Lesson({
  icon,
  title,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
}) {
  return (
    <div
      className="
        bg-black/40
        border
        border-white/5
        rounded-2xl
        p-4
        flex
        items-center
        justify-between
      "
    >

      <div className="flex items-center gap-3">

        <div className="text-violet-400">
          {icon}
        </div>

        <span className="text-sm md:text-base">
          {title}
        </span>

      </div>

      <span className="text-zinc-400 text-sm">
        {status}
      </span>

    </div>
  );
}
