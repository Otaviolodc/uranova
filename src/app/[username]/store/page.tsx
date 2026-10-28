import CatalogImage from "@/components/marketplace/CatalogImage";
import StoreCatalog from "@/components/marketplace/StoreCatalog";
import { createClient } from "@/lib/supabase/server";

export default async function StorePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {

  const { username } = await params;

  const supabase = await createClient();

  // PROFILE
const {
  data: profile,
  error: profileError,
} = await supabase
  .from("public_profiles")
  .select(`
    id,
    username,
    bio,
    avatar_url
  `)
  .eq("username", username)
  .maybeSingle();

  if (profileError) {
    return <div role="alert" className="min-h-screen bg-black text-white flex items-center justify-center">Não foi possível carregar a loja. Atualize a página para tentar novamente.</div>;
  }
  if (!profile) {

  return (
    <div className="
      min-h-screen
      bg-black
      text-white
      flex
      items-center
      justify-center
    ">
      Loja não encontrada
    </div>
  );

}
  
  // PRODUCTS
const {
  data: products,
  error: productsError,
} = await supabase
  .from("products")
  .select(`
    id,
    title,
    price,
    image_url,
    affiliate_url,
    marketplace
  `)
  .eq("user_id", profile.id);

  const safeProducts = products || [];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <div className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">

          <div className="flex flex-col md:flex-row items-center gap-8">

            <CatalogImage src={profile.avatar_url} alt={profile.username}
              className="w-32 h-32 shrink-0 rounded-full border-4 border-green-500" />

            <div>

              <h1 className="text-5xl font-black">
                {profile?.username}
              </h1>

              <p className="text-zinc-400 mt-3 text-lg">
                {profile?.bio}
              </p>

            </div>

          </div>

        </div>

      </div>

      <StoreCatalog products={safeProducts} failed={Boolean(productsError)} />
    </div>
  );
}
