"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import MobilePreview from "@/components/dashboard/MobilePreview";

export default function LinksPage() {
  type Link = {
  id: string;
  title: string;
  description: string | null;
  affiliate_url: string;
  image_url: string | null;
  slug: string;
  clicks: number;
  position: number;
};

  const [links, setLinks] =
    useState<Link[]>([]);

  type Profile = {
  username?: string | null;
  name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  instagram?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
};

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [showModal, setShowModal] =
    useState(false);

  const [editingLink, setEditingLink] =
    useState<Link | null>(null);

  // FORM
  const [title, setTitle] = useState("");
  const [loadingAI, setLoadingAI] =
    useState(false);

  const [description, setDescription] =
    useState("");

  const [hashtags, setHashtags] =
    useState("");

  const [cta, setCta] =
    useState("");

  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] =
    useState("");

  // 🚀 carregar dados
  const fetchData = async () => {

    const sessionResult =
  await supabase.auth.getSession();

const user =
  sessionResult.data.session?.user;

if (!user) {
  return;
}

    // 👤 perfil
    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        username,
        name,
        bio,
        avatar_url,
        instagram,
        telegram,
        whatsapp
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {

      console.error(profileError);

      return;

    }

    setProfile(profileData);

    // 🔗 links
    const {
  data: linksData,
  error: linksError,
} = await supabase
  .from("links")
  .select(`
    id,
    title,
    description,
    affiliate_url,
    image_url,
    slug,
    clicks,
    position
  `)
  .eq("user_id", user.id)
  .order("position", {
    ascending: true,
  });

if (linksError) {

  console.error(linksError);

  return;

}

    setLinks(linksData || []);

    };

  useEffect(() => {

  fetchData();

}, []);

// 📸 upload imagem produto
const handleImageUpload = async (
  e: any
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const fileExt =
    file.name.split(".").pop();

  const fileName = `${user.id}-${Date.now()}.${fileExt}`;

  const { error } =
    await supabase.storage
      .from("products")
      .upload(fileName, file, {
        upsert: true,
      });

  if (error) {
    console.log(error);

    alert(error.message);

    return;
  }

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  setImageUrl(data.publicUrl);
};

// 🤖 gerar título IA

const handleGenerateTitle =
  async () => {

    if (!title) {

      alert(
        "Digite um nome base"
      );

      return;

    }

    try {

      setLoadingAI(true);

      const response =
        await fetch(
          "/api/ai/chat",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              message: `
              Crie um título altamente persuasivo e curto para:

              ${title}

              focado em:
              vendas,
              cliques,
              conversão,
              marketing digital.
              `,

            }),

          }
        );

      const data =
        await response.json();

      setTitle(data.message);

    } catch (error) {

      console.log(error);

      alert("Erro IA");

    } finally {

      setLoadingAI(false);

    }

};

const handleGenerateDescription =
  async () => {

    if (!title) {

      alert(
        "Digite um título"
      );

      return;

    }

    try {

      setLoadingAI(true);

      const response =
        await fetch(
          "/api/ai/chat",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              message: `
              Crie uma descrição altamente persuasiva para:

              ${title}

              focada em:
              conversão,
              vendas,
              marketing digital,
              tráfego,
              gatilhos mentais.

              Máximo 2 frases.
              `,

            }),

          }
        );

      const data =
        await response.json();

      setDescription(
        data.message
      );

    } catch (error) {

      console.log(error);

      alert("Erro IA");

    } finally {

      setLoadingAI(false);

    }

};

// 🤖 gerar CTA + hashtags

const handleGenerateMarketing =
  async () => {

    if (!title) {

      alert(
        "Digite um título"
      );

      return;

    }

    try {

      setLoadingAI(true);

      const response =
        await fetch(
          "/api/ai/chat",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              message: `
              Produto:

              ${title}

              Crie:

              1 CTA altamente persuasivo

              +
              
              5 hashtags virais

              focado em:
              vendas,
              conversão,
              Instagram,
              TikTok,
              marketing digital.
              `,

            }),

          }
        );

      const data =
        await response.json();

      const text =
        data.message;

      const parts =
        text.split("#");

      setCta(parts[0]);

      setHashtags(
        "#" +
        parts
          .slice(1)
          .join("#")
      );

    } catch (error) {

      console.log(error);

      alert("Erro IA");

    } finally {

      setLoadingAI(false);

    }

};

  // 🚀 criar link
  const handleCreate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!title || !url) {
      alert("Preencha os campos");
      return;
    }

    const slug =
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    const { error } = await supabase
      .from("links")
      .insert([
        {
          title,
          description,
          affiliate_url: url,
          image_url: imageUrl,
          slug,
          clicks: 0,
          user_id: user.id,
        },
      ]);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setTitle("");
    setUrl("");
    setImageUrl("");

    setShowModal(false);

    fetchData();
  };

  // ✏️ editar
  const handleOpenEdit = (
    link: Link
  ) => {
    setEditingLink(link);

    setTitle(link.title);
    setUrl(link.affiliate_url);
    setImageUrl(link.image_url || "");
    setDescription(link.description || "");

    setShowModal(true);
  };

  // 💾 salvar edição
  const handleSaveEdit = async () => {
    if (!editingLink) return;

    const { error } = await supabase
      .from("links")
      .update({
        title,
        description,
        affiliate_url: url,
        image_url: imageUrl,
      })
      .eq("id", editingLink.id);

    if (error) {
      console.log(error);
      alert("Erro ao editar");
      return;
    }

    setShowModal(false);

    setEditingLink(null);

    setTitle("");
    setUrl("");
    setImageUrl("");
    setDescription("");

    fetchData();
  };

  // 🗑️ deletar
  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = confirm(
      "Deseja remover esse link?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("links")
      .delete()
      .eq("id", id);

    fetchData();
  };

  // 📊 métricas
  const handleDragEnd = async (
  result: any
) => {

  if (!result.destination) return;

  const items = Array.from(links);

  const [reorderedItem] =
    items.splice(
      result.source.index,
      1
    );

  items.splice(
    result.destination.index,
    0,
    reorderedItem
  );

  setLinks(items);

  // 🚀 salvar no banco
  const updates = items.map(
    (item, index) => {

      return supabase
        .from("links")
        .update({
          position: index + 1,
        })
        .eq("id", item.id);

    }
  );

  await Promise.all(updates);

};

  return (
    <div className="flex bg-black text-white min-h-screen">

      <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8 flex gap-8">

        {/* CONTEÚDO */}
        <div className="flex-1">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">

            <div>

              <h1 className="text-2xl md:text-3xl font-bold">
                Links
              </h1>

              <p className="text-gray-400 mt-1">
                Gerencie sua página pública
              </p>

          </div>


</div>

          {/* LINK PÚBLICO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">

            <p className="text-sm text-gray-400">
              Sua página pública
            </p>

            <a
              href={`/${profile?.username}`}
              target="_blank"
              className="text-green-400 text-lg md:text-2xl font-bold mt-2 block break-all"
            >
              Uranova.com/{profile?.username}
            </a>

          </div>

          {/* LINKS */}

          <div className="mt-14 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

            <div className="p-6 border-b border-zinc-800">
         
              <h2 className="text-xl font-bold">
                Seus Links
              </h2>

            </div>

            {links.length === 0 ? (

  <div className="p-16 text-center text-gray-500">
    Nenhum link criado
  </div>

) : (

<DragDropContext
  onDragEnd={handleDragEnd}
>

<Droppable droppableId="links">

{(provided) => (

<div
  {...provided.droppableProps}
  ref={provided.innerRef}
>

{links.map((link, index) => (

<Draggable
  key={link.id}
  draggableId={link.id}
  index={index}
>

{(provided) => (

<div
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
  className="
    flex
    flex-col
    md:flex-row
    gap-4
    md:gap-0
    items-start
    md:items-center
    justify-between
    p-6
    border
    border-zinc-800
    rounded-3xl
    mb-4
    hover:bg-zinc-800/30
    hover:border-green-500/20
    transition-all
  "
>

{/* ESQUERDA */}
<div className="flex items-center gap-4">

{link.image_url ? (

<img
  src={link.image_url}
  className="
    w-16 md:w-24
    h-16 md:h-24
    object-cover
    rounded-3xl
  "
/>

) : (

<div
  className="
    w-16 md:w-24
    h-16 md:h-24
    rounded-3xl
    bg-zinc-800
    flex
    items-center
    justify-center
  "
>
📦
</div>

)}

<div>

<h3 className="font-semibold text-lg">
  {link.title}
</h3>

<p className="text-gray-400 text-sm">
  {link.clicks} cliques
</p>

</div>

</div>

{/* BOTÕES */}
<div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">

<button
  onClick={() =>
    navigator.clipboard.writeText(
      `${window.location.origin}/go/${link.slug}`
    )
  }
  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm"
>
  Copiar
</button>

<button
  onClick={() =>
    handleOpenEdit(link)
  }
  className="bg-blue-500 hover:bg-blue-400 text-black px-4 py-2 rounded-xl text-sm font-semibold"
>
  Editar
</button>

<button
  onClick={() =>
    handleDelete(link.id)
  }
  className="bg-red-500 hover:bg-red-400 text-black px-4 py-2 rounded-xl text-sm font-semibold"
>
  Remover
</button>

</div>

</div>

)}

</Draggable>

))}

{provided.placeholder}

</div>

)}

</Droppable>

</DragDropContext>

)}
              
          </div>

        </div>

        <div className="xl:hidden fixed bottom-5 right-5 z-40">

  <button
    onClick={() => {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setImageUrl("");
      setShowModal(true);
    }}
    className="
      bg-green-500
      hover:bg-green-400
      text-black
      font-bold
      px-5
      py-4
      rounded-full
      shadow-lg
    "
  >
    + Novo Link
  </button>

</div>

  {/* PREVIEW DESKTOP */}
<div className="hidden xl:flex flex-col items-center">

  <MobilePreview
    profile={profile}
    links={links}
  />

  <button
    onClick={() => {
      setEditingLink(null);
      setTitle("");
      setUrl("");
      setImageUrl("");
      setShowModal(true);
    }}
    className="
      mt-5
      w-full
      bg-green-500
      hover:bg-green-400
      transition
      text-black
      py-3
      rounded-2xl
      font-bold
    "
  >
    + Novo Link
  </button>

</div>

{/* PREVIEW MOBILE */}
<div className="xl:hidden mt-8 flex justify-center">

  <MobilePreview
    profile={profile}
    links={links}
  />

</div>

        {/* MODAL */}
        {showModal && (
          <div
            className="
              fixed
              inset-0
              bg-black/70
              backdrop-blur-sm
              z-50
              overflow-y-auto
              p-6
            "
          >

          <div
            className="
              bg-zinc-900
              border
              border-zinc-800
              w-full
              max-w-lg
              rounded-3xl
              p-8
              mx-auto
              my-10
            "
          >

              <h2 className="text-2xl font-bold mb-6">
                {editingLink
                  ? "Editar Link"
                  : "Novo Link"}
              </h2>

              {/* TÍTULO */}
              <input
                placeholder="Título"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl mb-4"
              />

              <button
                onClick={handleGenerateTitle}
                className="
                  mb-4
                  bg-green-500
                  hover:bg-green-400
                  transition
                  text-black
                  px-4
                  py-2
                  rounded-2xl
                  font-semibold
                "
              >

                {loadingAI
                  ? "Gerando..."
                  : "🤖 Gerar título IA"}

              </button>

              {/* DESCRIÇÃO */}

              <textarea
                placeholder="Descrição"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-800
                  p-4
                  rounded-2xl
                  mb-4
                  h-32
                "
              />

              <button
                onClick={
                  handleGenerateDescription
                }
                className="
                  mb-4
                  bg-purple-500
                  hover:bg-purple-400
                  transition
                  text-white
                  px-4
                  py-2
                  rounded-2xl
                  font-semibold
                "
              >

                {loadingAI
                  ? "Gerando..."
                  : "🤖 Gerar descrição IA"}

              </button>

              {/* CTA */}

<textarea
  placeholder="CTA"
  value={cta}
  onChange={(e) =>
    setCta(e.target.value)
  }
  className="
    w-full
    bg-zinc-800
    p-4
    rounded-2xl
    mb-4
    h-24
  "
/>

{/* HASHTAGS */}

<textarea
  placeholder="Hashtags"
  value={hashtags}
  onChange={(e) =>
    setHashtags(
      e.target.value
    )
  }
  className="
    w-full
    bg-zinc-800
    p-4
    rounded-2xl
    mb-4
    h-24
  "
/>

<button
  onClick={
    handleGenerateMarketing
  }
  className="
    mb-4
    bg-pink-500
    hover:bg-pink-400
    transition
    text-white
    px-4
    py-2
    rounded-2xl
    font-semibold
  "
>

  {loadingAI
    ? "Gerando..."
    : "🤖 Gerar CTA + Hashtags"}

</button>

              {/* URL */}
              <input
                placeholder="URL afiliado"
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                className="w-full bg-zinc-800 p-4 rounded-2xl mb-4"
              />

              {/* UPLOAD IMAGEM */}
              <div className="mb-4">

                <label className="text-sm text-zinc-400 mb-2 block">
                  Upload da imagem
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-zinc-800 p-4 rounded-2xl"
              />

                {imageUrl && (
                <img
                    src={imageUrl}
                    className="w-32 h-32 rounded-2xl object-cover mt-4"
               />
            )}

         </div>

              {/* PREVIEW */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  className="
                    w-full
                    max-h-72
                    object-contain
                    rounded-2xl
                    mb-5
                  "
                />
              )}

              {/* BOTÕES */}
              <div className="flex gap-3">

                <button
                  onClick={
                    editingLink
                      ? handleSaveEdit
                      : handleCreate
                  }
                  className="flex-1 bg-green-500 hover:bg-green-400 transition text-black py-3 rounded-2xl font-semibold"
                >
                  {editingLink
                    ? "Salvar"
                    : "Criar Link"}
                </button>

                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 bg-zinc-800 py-3 rounded-2xl"
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>
       )}

      </div>

    </div>
  );
  }