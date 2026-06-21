type Props = {
  profile: any;
  links: any[];
};

export default function MobilePreview({
  profile,
  links,
}: Props) {
  return (
    <div className="sticky top-6">

      {/* CELULAR */}
      <div className="w-[340px] h-[700px] bg-black rounded-[40px] border-8 border-zinc-800 shadow-2xl overflow-hidden">

        {/* TOPO */}
        <div className="h-6 bg-zinc-900 flex items-center justify-center">
          <div className="w-24 h-1 bg-zinc-700 rounded-full"></div>
        </div>

        {/* CONTEÚDO */}
        <div
          className="h-full overflow-y-auto px-5 py-8"
          style={{
            background:
              "linear-gradient(180deg,#050505,#111111)",
          }}
        >

          {/* FOTO */}
          <div className="flex flex-col items-center">

            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-24 h-24 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-3xl font-bold">
                {profile?.username?.[0]?.toUpperCase()}
              </div>
            )}

            {/* NOME */}
            <h1 className="text-white text-2xl font-bold mt-4">
              {profile?.name || profile?.username}
            </h1>

            {/* BIO */}
            <p className="text-gray-300 text-sm text-center mt-2">
              {profile?.bio ||
                "Sua bio aparece aqui"}
            </p>

          </div>

          {/* REDES */}
          <div className="flex justify-center gap-3 mt-5">

            {profile?.instagram && (
              <a
                href={profile.instagram}
                className="bg-white/10 text-white px-3 py-2 rounded-xl text-sm"
              >
                Instagram
              </a>
            )}

            {profile?.telegram && (
              <a
                href={profile.telegram}
                className="bg-white/10 text-white px-3 py-2 rounded-xl text-sm"
              >
                Telegram
              </a>
            )}

            {profile?.whatsapp && (
              <a
                href={profile.whatsapp}
                className="bg-white/10 text-white px-3 py-2 rounded-xl text-sm"
              >
                WhatsApp
              </a>
            )}

          </div>

          {/* LINKS */}
        <div className="mt-8 space-y-4">

        {links.map((link) => (

      <div
        key={link.id}
        className="
          bg-zinc-950/90
          border
          border-zinc-800
          rounded-3xl
          p-4
          shadow-lg
          hover:border-green-500/30
          transition-all
        "
      >

      <div className="flex items-center gap-4">

    {link.image_url ? (

      <img
        src={link.image_url}
        className="
          w-16
          h-16
          rounded-2xl
          object-cover
          border
          border-zinc-700
        "
      />

    ) : (

      <div
        className="
          w-16
          h-16
          rounded-2xl
          bg-zinc-800
          flex
          items-center
          justify-center
          text-2xl
        "
      >
        📦
      </div>

     )}

        <div className="flex-1">

          <h2 className="text-white font-bold text-lg">
            {link.title}
          </h2>

          <p className="text-zinc-400 text-sm mt-1">
            {link.description || "Clique para acessar"}
          </p>
         
        </div>

      </div>

    </div>

  ))}

</div>

          {/* FOOTER */}
          <div className="mt-10 text-center text-gray-400 text-xs">
            Powered by Uranova
           
          </div>

        </div>

      </div>

    </div>
  );
}