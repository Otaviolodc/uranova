import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function PublicPage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {

  const supabase = await createClient();

  const { username } = await params;

  // PROFILE
  const {
    data: profile,
    error: profileError
  } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        bio,
        avatar_url,
        theme_color,
        background_style,
        card_style,
        button_style,
        featured_url,
        featured_text,
        instagram,
        telegram,
        whatsapp,
        subscription_status,
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

  // LINKS
  const { data } =
    await supabase
      .from("links")
      .select(`
        id,
        title,
        slug,
        image_url,
        clicks
     `)
      .eq("user_id", profile.id)
      .order("created_at", {
        ascending: true,
      });

  const links = data || [];

  // BACKGROUND
  const backgroundClass =
    profile?.background_style ===
    "gradient"
      ? "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"
      : profile?.background_style ===
        "neon"
      ? "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600"
      : "bg-black";

  // CARD STYLE
  const cardClass =
    profile?.card_style ===
    "glass"
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

  // BUTTON STYLE
  const buttonRadius =
    profile?.button_style ===
    "square"
      ? "rounded-md"
      : "rounded-2xl";

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

      {/* HERO */}
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
            background:
              profile.theme_color ||
              "#6366f1",
          }}
        />

        {/* CARD */}
        <div className="relative z-10 flex flex-col items-center">

          {/* AVATAR */}
          {profile.avatar_url ? (

            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={128}
              height={128}
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

            <div className="
              w-32
              h-32
              rounded-full
              bg-white/10
              flex
              items-center
              justify-center
              text-5xl
              font-bold
            ">

              {username?.[0]?.toUpperCase()}

            </div>

          )}

          {/* USERNAME */}
          <h1 className="
            mt-6
            text-4xl
            font-black
            tracking-tight
          ">

            @{profile.username}

          </h1>

          {/* PRO */}
          {profile.subscription_status ===
            "active" && (

            <div className="
              mt-3
              px-4
              py-1
              rounded-full
              bg-green-500/20
              border
              border-green-400/30
              text-green-300
              text-sm
              font-semibold
              backdrop-blur-xl
            ">

              ✨ PRO MEMBER

            </div>

          )}

          {/* BIO */}
          {profile.bio && (

            <p className="
              text-center
              text-white/70
              mt-5
              max-w-xl
              text-lg
              leading-relaxed
            ">

              {profile.bio}

            </p>

          )}

        </div>

      </div>

      {/* FEATURED */}
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
            
          {profile.featured_text ||
            "🔥 Oferta Especial"}

        </a>

      )}

      {/* SOCIAL */}
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

      {/* PRODUCTS */}
      <div className="w-full max-w-2xl space-y-8">

        {links.length === 0 ? (

          <p className="text-white/70 text-center">

            Nenhum produto encontrado

          </p>

        ) : (

          links.map((link, index) => (

            <a
              key={link.id}
              href={`/go/${link.slug}`}
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
                  background:
                    profile.theme_color,
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
                    <div className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/80
                      to-transparent
                    " />

                    {/* BADGE */}
                    {index === 0 && (

                      <div className="
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
                      ">

                        🔥 EM ALTA

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
                      color:
                        profile?.product_text_color ||
                        "#ffffff",
                    }}
                  >

                    {link.title}

                  </h2>

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
                      background:
                        profile.theme_color ||
                        "#6366f1",
                      color: "#fff",
                    }}
                  >

                    Comprar Agora →

                  </div>

                </div>

              </div>

            </a>

          ))

        )}

      </div>

      {/* FOOTER */}
      <div className="mt-12 text-xs text-white/50">

        Powered by PromoLink

      </div>

    </div>

  );

}