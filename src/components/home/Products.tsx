import {
  BookOpen,
  FileText,
  Users,
  Repeat,
} from "lucide-react";

const items = [
  {
    icon: BookOpen,
    title: "Cursos Online",
  },
  {
    icon: FileText,
    title: "E-books",
  },
  {
    icon: Users,
    title: "Mentorias",
  },
  {
    icon: Repeat,
    title: "Assinaturas",
  },
];

export default function Products() {
  return (
    <section className="py-32 px-6">

      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center">
          Tudo em um só lugar
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="glass rounded-3xl p-8"
              >
                <Icon
                  size={32}
                  className="text-violet-400 mb-6"
                />

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}