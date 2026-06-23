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

      {links.length === 0 ? (

        <div className="p-10 text-center text-gray-400">
          Nenhum link criado ainda.
        </div>

      ) : (

        links.map((link) => (

          <div
            key={link.id}
            className="
              flex
              flex-col
              sm:flex-row
              sm:justify-between
              sm:items-center
              gap-3
              px-5
              py-4
              border-b
              last:border-b-0
              hover:bg-gray-50
              transition
            "
          >
            <div>

              <p className="font-medium break-all">
                {link.title}
              </p>

              <p className="text-sm text-gray-400 break-all">
                /go/{link.slug}
              </p>

            </div>

            <p className="font-bold text-green-600">
              {link.clicks} cliques
            </p>

          </div>

        ))

      )}

    </div>
  );
}