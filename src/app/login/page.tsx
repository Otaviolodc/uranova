"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);

  // 🚀 LOGIN
  const handleLogin = async () => {

  setLoading(true);

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setLoading(false);
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {

    router.push("/admin");

  } else {

    router.push("/dashboard/links");

  }

};

  // 🚀 CADASTRO
  const handleSignup = async () => {
    setLoading(true);

    if (!username) {
      alert("Digite username");
      setLoading(false);
      return;
    }

    // 🔥 criar conta
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Erro ao criar usuário");
      setLoading(false);
      return;
    }

    // 👤 criar perfil
    await supabase.from("profiles").insert([
      {
        id: user.id,
        username: username.toLowerCase(),
      },
    ]);

    // 💎 criar assinatura FREE
    await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: user.id,
          plan: "free",
          status: "active",
        },
      ]);

    alert("Conta criada com sucesso!");

    router.push("/dashboard/links");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

        {/* LOGO */}
        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-green-400">
            PromoLink
          </h1>

          <p className="text-gray-400 mt-2">
            Crie sua página de links premium
          </p>

        </div>

        {/* USERNAME */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full bg-zinc-800 p-4 rounded-xl mb-4 outline-none"
          />
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full bg-zinc-800 p-4 rounded-xl mb-4 outline-none"
        />

        {/* SENHA */}
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full bg-zinc-800 p-4 rounded-xl mb-6 outline-none"
        />

        {/* BOTÃO */}
        <button
          onClick={
            isLogin ? handleLogin : handleSignup
          }
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black py-4 rounded-xl font-bold"
        >
          {loading
            ? "Carregando..."
            : isLogin
            ? "Entrar"
            : "Criar Conta"}
        </button>

        {/* TROCAR LOGIN/CADASTRO */}
        <button
          onClick={() =>
            setIsLogin(!isLogin)
          }
          className="w-full mt-6 text-gray-400 hover:text-white transition"
        >
          {isLogin
            ? "Não possui conta? Criar agora"
            : "Já possui conta? Entrar"}
        </button>

      </div>

    </div>
  );
}