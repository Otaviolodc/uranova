import {
  BookOpen,
  GraduationCap,
  Users,
  Repeat,
  Link2,
  FileText,
} from "lucide-react";

const products = [
  {
    icon: GraduationCap,
    title: "Cursos Online",
    description:
      "Crie treinamentos completos com módulos, aulas e certificados.",
  },
  {
    icon: FileText,
    title: "E-books",
    description:
      "Venda materiais digitais com entrega automática após a compra.",
  },
  {
    icon: Users,
    title: "Mentorias",
    description:
      "Ofereça acompanhamento individual ou em grupo para seus alunos.",
  },
  {
    icon: Repeat,
    title: "Assinaturas",
    description:
      "Construa uma receita recorrente com cobranças automáticas.",
  },
  {
    icon: BookOpen,
    title: "Comunidades",
    description:
      "Crie áreas exclusivas para membros e fortaleça sua audiência.",
  },
  {
    icon: Link2,
    title: "Linktree Profissional",
    description:
      "Centralize todos os seus produtos, links e ofertas em uma página.",
  },
];

export default function Products() {
  return (
    <section
      id="produtos"
      className="py-28 px-6"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Monetize seu conhecimento
          </span>

          <h2 className="text-5xl font-bold mt-4">
            Tudo o que você pode vender
          </h2>

          <p className="text-zinc-400 text-lg mt-6">
            A Uranova foi criada para criadores digitais,
            infoprodutores, afiliados e especialistas que
            desejam transformar conhecimento em receita.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">

          {products.map((item) => (
            <div
              key={item.title}
              className="
                glass
                card-hover
                rounded-3xl
                p-8
              "
            >
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">

                <item.icon
                  size={28}
                  className="text-violet-400"
                />

              </div>

              <h3 className="text-2xl font-semibold mb-4">
                {item.title}
              </h3>

              <p className="text-zinc-400 leading-relaxed">
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}