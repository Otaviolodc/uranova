import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function PublicPage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const supabase = await createClient();

  const { username } = await params;

  // ==========================================================
  // ROTAS RESERVADAS
  // ==========================================================

  const reservedRoutes = [
    "login",
    "auth",
    "dashboard",
    "admin",
    "checkout",
    "api",
  ];

  if (reservedRoutes.includes(username)) {
    return null;
  }

  // ==========================================================
  // PROFILE
  // ==========================================================

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      bio,
      avatar_url,
      theme_color,
      background_style,
      is_pro,
      card_style,
      button_style,
      featured_url,
      featured_text,
      instagram,
      telegram,
      whatsapp,
      product_text_color
    `)
    .eq("username", username)
    .maybeSingle();

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Usuário não encontrado
      </div>
    );
  }

  // ==========================================================
  // PLANO
  //
  // FREE = identidade padrão Uranova
  // PRO  = personalização liberada
  // ==========================================================

  const isPro = Boolean(profile.is_pro);

  // ==========================================================
  // PERSONALIZAÇÃO EFETIVA
  //
  // Aqui definimos exatamente o que será usado na página.
  // Isso impede que um usuário FREE utilize configurações
  // antigas salvas no banco.
  // ==========================================================

  const effectiveThemeColor = isPro
    ? profile.theme_color || "#00ff88"
    : "#00ff88";

  const effectiveBackgroundStyle = isPro
    ? profile.background_style || "default"
    : "default";

  const effectiveCardStyle = isPro
    ? profile.card_style || "default"
    : "default";

  const effectiveButtonStyle = isPro
    ? profile.button_style || "rounded"
    : "rounded";

  const effectiveProductTextColor = isPro
    ? profile.product_text_color || "#ffffff"
    : "#ffffff";

  // ==========================================================
  // LINKS
  // ==========================================================

  const { data: linksData } = await supabase
    .from("links")
    .select(`
      id,
      title,
      description,
      slug,
      image_url,
      clicks
    `)
    .eq("user_id", profile.id)
    .order("created_at", {
      ascending: true,
    });

  const links = linksData || [];

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const { data: products } = await supabase
    .from("products_checkout")
    .select("*")
    .eq("user_id", profile.id)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    });

  const totalProducts = products?.length || 0;

  const totalLinks = links.length;

  const marketplaceProducts =
    products?.filter(
      (product) => product.is_marketplace
    ).length || 0;

  // ==========================================================
  // BACKGROUND
  //
  // FREE = sempre preto
  // PRO  = pode escolher o estilo
  // ==========================================================

  const backgroundClass =
    effectiveBackgroundStyle === "gradient"
      ? "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
      : effectiveBackgroundStyle === "neon"
      ? "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600"
      : "bg-black";

  // ==========================================================
  // CARD STYLE
  //
  // FREE = padrão Uranova
  // PRO  = pode usar Glass
  // ==========================================================

  const cardClass =
    effectiveCardStyle === "glass"
      ? `
        bg-white/10
        backdrop-blur-2xl
        border
        border-white/10
      `
      : `
        bg-zinc-900
        border
        border-zinc-800
      `;

  // ==========================================================
  // BUTTON STYLE
  //
  // FREE = arredondado padrão
  // PRO  = pode escolher
  // ==========================================================

  const buttonRadius =
    effectiveButtonStyle === "square"
      ? "rounded-md"
      : "rounded-2xl";

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className={`
        min-h-screen
        ${backgroundClass}
        flex
        flex-col
        items-center
        px-6
        py-10
        text-white
      `}
    >
      {/* ======================================================
          HERO
      ====================================================== */}

      <div className="relative flex flex-col items-center mb-12 w-full">

        {/* GLOW */}

        <div
          className="
            absolute
            w-72
            h-72
            rounded-full
            blur-3xl
            opacity-30
          "
          style={{
            background: effectiveThemeColor,
          }}
        />

        {/* PERFIL */}

        <div className="relative z-10 flex flex-col items-center">

          {/* AVATAR */}

          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={128}
              height={128}
              loading="eager"
              unoptimized
              className="
                w-32
                h-32
                rounded-full
                object-cover
                border-4
                border-white/20
                shadow-[0_0_60px_rgba(255,255,255,0.2)]
              "
            />
          ) : (
            <div
              className="
                w-32
                h-32
                rounded-full
                bg-white/10
                flex
                items-center
                justify-center
                text-5xl
                font-bold
              "
            >
              {username?.[0]?.toUpperCase()}
            </div>
          )}

          {/* USERNAME */}

          <h1
            className="
              mt-6
              text-4xl
              font-black
              tracking-tight
            "
          >
            @{profile.username}
          </h1>

          {/* BIO */}

          {profile.bio && (
            <p
              className="
                text-center
                text-white/70
                mt-5
                max-w-xl
                text-lg
                leading-relaxed
              "
            >
              {profile.bio}
            </p>
          )}

          {/* ==================================================
              ESTATÍSTICAS
          ================================================== */}

          <div className="grid grid-cols-3 gap-4 mt-6">

            <div
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                p-4
                text-center
              "
            >
              <h3 className="text-2xl font-black text-green-400">
                {totalProducts}
              </h3>

              <p className="text-zinc-400 text-sm">
                Produtos
              </p>
            </div>

            <div
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                p-4
                text-center
              "
            >
              <h3 className="text-2xl font-black text-green-400">
                {totalLinks}
              </h3>

              <p className="text-zinc-400 text-sm">
                Links
              </p>
            </div>

            <div
              className="
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                p-4
                text-center
              "
            >
              <h3 className="text-2xl font-black text-green-400">
                {marketplaceProducts}
              </h3>

              <p className="text-zinc-400 text-sm">
                Marketplace
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================
          FEATURED
      ====================================================== */}

      {profile.featured_url && (
        <a
          href={profile.featured_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            mb-8
            px-8
            py-4
            bg-white
            text-black
            font-bold
            shadow-xl
            transition
            hover:scale-105
            ${buttonRadius}
          `}
        >
          {profile.featured_text || "Oferta Especial"}
        </a>
      )}

      {/* ======================================================
          SOCIAL
      ====================================================== */}

      <div className="flex gap-4 mb-8 flex-wrap justify-center">

        {profile.instagram && (
          <a
            href={profile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              px-4
              py-2
              bg-white/10
              hover:bg-white/20
              transition
              ${buttonRadius}
            `}
          >
            Instagram
          </a>
        )}

        {profile.telegram && (
          <a
            href={profile.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              px-4
              py-2
              bg-white/10
              hover:bg-white/20
              transition
              ${buttonRadius}
            `}
          >
            Telegram
          </a>
        )}

        {profile.whatsapp && (
          <a
            href={profile.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              px-4
              py-2
              bg-white/10
              hover:bg-white/20
              transition
              ${buttonRadius}
            `}
          >
            WhatsApp
          </a>
        )}

      </div>

      {/* ======================================================
          PRODUTOS DO CRIADOR
      ====================================================== */}

      {products && products.length > 0 && (
        <div className="w-full max-w-6xl mb-12">

          <h2 className="text-3xl font-black mb-6">
            Produtos do Criador
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {products.map((product) => (
              <a
                key={product.id}
                href={`/checkout/product/${product.checkout_slug}`}
                className="
                  bg-zinc-900
                  border
                  border-zinc-800
                  rounded-3xl
                  overflow-hidden
                  hover:border-green-500/30
                  transition-all
                "
              >

                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="
                      w-full
                      h-52
                      object-cover
                    "
                  />
                )}

                <div className="p-5">

                  <p className="text-green-400 text-xs font-bold">
                    {product.type?.toUpperCase()}
                  </p>

                  <h3 className="text-xl font-bold mt-2">
                    {product.title}
                  </h3>

                  <p className="text-green-400 text-2xl font-black mt-4">
                    R$ {product.price}
                  </p>

                  <div
                    className="
                      mt-4
                      bg-green-500
                      text-black
                      text-center
                      py-2
                      rounded-xl
                      font-bold
                    "
                  >
                    Ver Produto
                  </div>

                </div>

              </a>
            ))}

          </div>

        </div>
      )}

      {/* ======================================================
          LINKS
      ====================================================== */}

      <div className="w-full max-w-2xl space-y-8">

        {links.length === 0 ? (
          <p className="text-white/70 text-center">
            Nenhum link encontrado
          </p>
        ) : (
          links.map((link, index) => (
            <a
              key={link.id}
              href={`/checkout/go/${link.slug}`}
              className="
                group
                relative
                block
                overflow-hidden
                transition-all
                duration-300
                hover:scale-[1.02]
              "
            >

              {/* GLOW */}

              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  blur-2xl
                  transition
                "
                style={{
                  background: effectiveThemeColor,
                }}
              />

              {/* CARD */}

              <div
                className={`
                  relative
                  overflow-hidden
                  shadow-2xl
                  ${cardClass}
                  ${buttonRadius}
                `}
              >

                {/* IMAGE */}

                {link.image_url && (
                  <div className="relative">

                    <Image
                      src={link.image_url}
                      alt={link.title}
                      width={800}
                      height={500}
                      unoptimized
                      className="
                        w-full
                        h-64
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />

                    {/* OVERLAY */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/80
                        to-transparent
                      "
                    />

                    {/* DESTAQUE */}

                    {index === 0 && (
                      <div
                        className="
                          absolute
                          top-4
                          left-4
                          px-4
                          py-1
                          rounded-full
                          bg-green-500
                          text-black
                          text-sm
                          font-bold
                          shadow-xl
                        "
                      >
                        DESTAQUE
                      </div>
                    )}

                  </div>
                )}

                {/* CONTENT */}

                <div className="p-6">

                  {/* TITLE */}

                  <h2
                    className="
                      text-2xl
                      font-black
                      leading-tight
                    "
                    style={{
                      color: effectiveProductTextColor,
                    }}
                  >
                    {link.title}
                  </h2>

                  {/* DESCRIPTION */}

                  <p className="text-white/70 mt-3 leading-relaxed">
                    {link.description}
                  </p>

                  {/* CLICKS */}

                  <p className="text-white/50 mt-2">
                    {link.clicks} cliques
                  </p>

                  {/* BUTTON */}

                  <div
                    className={`
                      mt-6
                      w-full
                      py-4
                      text-center
                      font-bold
                      text-lg
                      transition
                      group-hover:scale-[1.01]
                      ${buttonRadius}
                    `}
                    style={{
                      background: effectiveThemeColor,
                      color: "#fff",
                    }}
                  >
                    Saiba Mais →
                  </div>

                </div>

              </div>

            </a>
          ))
        )}

      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="mt-12 text-xs text-white/50">
        Powered by Uranova
      </div>

    </div>
  );
}