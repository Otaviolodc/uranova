type Link = {
  id: string;
  title: string;
  slug: string;
  clicks: number;
};

type LinkListProps = {
  links: Link[];
};

export function LinkList({
  links,
}: LinkListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border">
      <div className="p-5 border-b">
        <h3 className="font-semibold">
          Seus Links
        </h3>
      </div>

      {links.map((link) => (
        <div
          key={link.id}
          className="flex justify-between items-center px-5 py-4 hover:bg-gray-50"
        >
          <div>
            <p className="font-medium">
              {link.title}
            </p>

            <p className="text-sm text-gray-400">
              /go/{link.slug}
            </p>
          </div>

          <p className="font-bold">
            {link.clicks} cliques
          </p>
        </div>
      ))}
    </div>
  );
}