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
      "Crie treinamentos completos com módulos, aulas e certificados para seus alunos.",
  },
  {
    icon: FileText,
    title: "E-books",
    description:
      "Venda materiais digitais e faça a entrega automaticamente após a compra.",
  },
  {
    icon: Users,
    title: "Mentorias",
    description:
      "Ofereça acompanhamento individual ou em grupo e monetize sua experiência.",
  },
  {
    icon: Repeat,
    title: "Assinaturas",
    description:
      "Construa uma receita recorrente com cobranças automáticas e previsibilidade.",
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
      "Centralize produtos, redes sociais e ofertas em uma única página.",
  },
];

export default function Products() {
  return (
    <section
      id="produtos"
      className="py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <span className="text-violet-400 font-medium">
            Monetize seu conhecimento
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Tudo o que você pode vender
          </h2>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">
            A Uranova foi criada para criadores digitais,
            especialistas, infoprodutores e afiliados que
            desejam transformar conhecimento em receita.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

          {products.map((item) => (
            <div
              key={item.title}
              className="
                glass
                card-hover
                rounded-[32px]
                p-8
                border
                border-white/5
                shadow-lg
                shadow-black/20
              "
            >

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-violet-500/10
                flex
                items-center
                justify-center
                mb-6
              ">

                <item.icon
                  size={30}
                  className="text-violet-400"
                />

              </div>

              <h3 className="text-xl font-bold mb-4">
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

