"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {

  const [views, setViews] = useState(0);

  const [topProducts, setTopProducts] = useState<any[]>([]);

  async function fetchAnalytics() {

    useEffect(() => {

  fetchAnalytics();

}, []);

  const { data: userData } =
    await supabase.auth.getUser();

  const user = userData.user;

  if (!user) return;

  // BUSCAR ANALYTICS
  const { data: analyticsData } =
    await supabase
      .from("analytics")
      .select("*")
      .eq("user_id", user.id);

  // TOTAL DE VIEWS
  setViews(
    analyticsData?.length || 0
  );

  // AGRUPAR VIEWS POR DIA

const groupedDays: any = {};

analyticsData?.forEach((item) => {

  const date =
    new Date(item.created_at)
      .toLocaleDateString("pt-BR", {
        weekday: "short",
      });

  if (!groupedDays[date]) {
    groupedDays[date] = 0;
  }

  groupedDays[date]++;

});

const formattedChart =
  Object.entries(groupedDays).map(
    ([day, clicks]) => ({
      day,
      clicks,
    })
  );

setChartData(formattedChart);

  // AGRUPAR PRODUTOS
  const grouped: any = {};

  analyticsData?.forEach((item) => {

    if (!grouped[item.product_id]) {
      grouped[item.product_id] = 0;
    }

    grouped[item.product_id]++;

  });

  const ranking = Object.entries(grouped)
    .map(([id, total]) => ({
      id,
      total,
    }))
    .sort((a: any, b: any) => b.total - a.total);

  setTopProducts(ranking);

  console.log(ranking);

  useEffect(() => {

  fetchAnalytics();

}, []);

}
  const [chartData, setChartData] =
  useState<any[]>([]);

  const aiMessage = views > 50
  ? "🚀 Seu perfil está crescendo acima da média hoje."
  : views > 20
  ? "🔥 Seus produtos estão começando a ganhar tráfego."
  : "📈 Continue divulgando seus produtos para aumentar as visualizações.";

const links = [
  1, 2, 3, 4, 5
];

const scoreIA =
  Math.min(
    100,
    (
      links.length * 12 +
      views * 2
    )
  );

  const heatmapData = [

  { hour: "08h", level: 1 },

  { hour: "10h", level: 2 },

  { hour: "12h", level: 3 },

  { hour: "14h", level: 2 },

  { hour: "16h", level: 4 },

  { hour: "18h", level: 5 },

  { hour: "20h", level: 4 },

  { hour: "22h", level: 2 },

];

const radarData = [

  {
    name: "Conversão",
    value: 82,
  },

  {
    name: "Engajamento",
    value: 74,
  },

  {
    name: "CTR",
    value: 91,
  },

  {
    name: "Potencial Viral",
    value: 88,
  },

  {
    name: "Performance",
    value: 79,
  },

];

const [message, setMessage] =
  useState("");

const [chatMessages, setChatMessages] =
  useState([
    {
      role: "assistant",
      text: "🚀 Olá! Sou a IA do PromoLink. Posso ajudar na sua conversão.",
    },
  ]);

  const handleSendMessage = () => {

  if (!message) return;

  const userMessage = {
    role: "user",
    text: message,
  };

  let aiResponse =
    "🚀 Continue postando links diariamente.";

  // IA SIMULADA
  if (
    message.toLowerCase().includes("produto")
  ) {

    aiResponse =
      "🔥 Produtos fitness e tecnologia estão em alta hoje.";

  }

  if (
    message.toLowerCase().includes("titulo")
  ) {

    aiResponse =
      "📈 Títulos curtos convertem mais. Use até 45 caracteres.";

  }

  if (
    message.toLowerCase().includes("vender")
  ) {

    aiResponse =
      "💰 Poste seus links entre 19h e 22h para maior conversão.";

  }

  setChatMessages((prev) => [
    ...prev,
    userMessage,
    {
      role: "assistant",
      text: aiResponse,
    },
  ]);

  setMessage("");

};

return (

    <div className="flex bg-black text-white min-h-screen">
         
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-4xl font-black">
            ⚡ Centro de IA e Performance
          </h1>

          <p className="text-gray-400 mt-2 text-lg">
            IA analisando seus links em tempo real
          </p>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <div className="mt-10 bg-zinc-900 p-6 rounded-3xl">

  <h2 className="text-2xl font-bold mb-6">
    🔥 Produtos em Alta
  </h2>

  <div className="space-y-4">

    {topProducts.map((product: any, index) => (

      <div
        key={product.id}
        className="flex items-center justify-between bg-black/40 border border-zinc-800 rounded-2xl p-4"
      >

        <div>
          <p className="text-sm text-zinc-500">
            #{index + 1}
          </p>

          <h3 className="font-bold">
            Produto ID:
            {product.id}
          </h3>
        </div>

        <div className="text-green-400 font-black text-2xl">
          {product.total}
        </div>

      </div>

    ))}

  </div>

</div>

          {/* RECEITA */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              💰 Receita Estimada
            </p>

            <h2 className="text-4xl font-black text-green-400 mt-3">
              R$ 2.450
            </h2>

            <p className="text-green-400 text-sm mt-2">
              +18% hoje
            </p>

          </div>

          {/* VISITANTES */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              👀 Visitantes Hoje
            </p>

            <h2 className="text-4xl font-black mt-3">
              1.284
            </h2>

            <p className="text-gray-400 text-sm mt-2">
              Tráfego em crescimento
            </p>

          </div>

          {/* CONVERSÃO */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              📈 Conversão
            </p>

            <h2 className="text-4xl font-black mt-3">
              4.8%
            </h2>

            <p className="text-green-400 text-sm mt-2">
              Acima da média
            </p>

          </div>

          {/* SCORE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              🧠 Score IA
            </p>

            <h2 className="text-4xl font-black mt-3 text-green-400">
              {scoreIA}/100
            </h2>

            <p className="text-gray-400 text-sm mt-2">
              Performance excelente
            </p>

          </div>

      </div>

        {/* GRÁFICO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h2 className="text-2xl font-bold">
                📈 Crescimento de Cliques
              </h2>

              <p className="text-gray-400 mt-1">
                Últimos 7 dias
              </p>

            </div>

            <div className="text-green-400 font-bold">
              +32%
            </div>

          </div>

          {/* BARRAS */}
          <div className="h-72">

  <ResponsiveContainer width="100%" height="100%">

    <LineChart data={chartData}>

      <XAxis
        dataKey="day"
        stroke="#888"
      />

      <YAxis
        stroke="#888"
      />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="clicks"
        stroke="#00ff66"
        strokeWidth={4}
      />

    </LineChart>

  </ResponsiveContainer>

</div>

        </div>

        {/* HEATMAP */}
<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">

  <div className="flex items-center justify-between mb-8">

    <div>

      <h2 className="text-2xl font-bold">
        🔥 Heatmap de Conversão
      </h2>

      <p className="text-gray-400 mt-1">
        Horários com maior atividade
      </p>

    </div>

    <div className="text-green-400 font-bold">
      IA ANALISANDO
    </div>

  </div>

  <div className="grid grid-cols-4 md:grid-cols-8 gap-4">

    {heatmapData.map((item) => (

      <div
        key={item.hour}
        className={`
          rounded-2xl
          p-4
          text-center
          border
          transition-all
          ${
            item.level >= 5
              ? "bg-green-500 text-black border-green-400"
              : item.level >= 4
              ? "bg-green-500/30 border-green-500"
              : item.level >= 3
              ? "bg-green-500/10 border-green-500/40"
              : "bg-zinc-800 border-zinc-700"
          }
        `}
      >

        <p className="font-bold">
          {item.hour}
        </p>

        <p className="text-sm mt-2">
          {item.level >= 5
            ? "PICO"
            : item.level >= 4
            ? "ALTO"
            : item.level >= 3
            ? "MÉDIO"
            : "BAIXO"}
        </p>

      </div>

    ))}

  </div>

</div>

{/* RADAR IA */}
<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">

  <div className="flex items-center justify-between mb-8">

    <div>

      <h2 className="text-2xl font-bold">
        🧠 Radar IA
      </h2>

      <p className="text-gray-400 mt-1">
        Análise inteligente da performance
      </p>

    </div>

    <div className="text-green-400 font-bold">
      IA ATIVA
    </div>

  </div>

  <div className="space-y-6">

    {radarData.map((item) => (

      <div key={item.name}>

        <div className="flex items-center justify-between mb-2">

          <p className="font-semibold">
            {item.name}
          </p>

          <p className="text-green-400 font-bold">
            {item.value}%
          </p>

        </div>

        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">

          <div
            className="
              bg-green-500
              h-full
              rounded-full
              transition-all
              duration-700
            "
            style={{
              width: `${item.value}%`,
            }}
          />

        </div>

      </div>

    ))}

  </div>

</div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* IA INSIGHTS */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              🤖 Insights da IA
            </h2>

            <div className="space-y-4">

  <div className="bg-zinc-800 rounded-2xl p-5 border border-green-500/20">

    <p className="text-green-400 font-semibold mb-2">
      IA ANALISANDO PERFORMANCE
    </p>

    <p className="text-lg">
      {aiMessage}
    </p>

  </div>

  <div className="bg-zinc-800 rounded-2xl p-5">

    <p>
      📊 Seus links tiveram aumento
      de 32% nas últimas 24h.
    </p>

  </div>

  <div className="bg-zinc-800 rounded-2xl p-5">

    <p>
      🎯 Produtos com imagem estão
      recebendo mais cliques.
    </p>

  </div>

</div>

</div>

{/* CHAT IA */}
<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mt-10">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-2xl font-bold">
        🤖 IA PromoLink
      </h2>

      <p className="text-gray-400 mt-1">
        Seu assistente de vendas inteligente
      </p>

    </div>

    <div className="text-green-400 font-bold">
      ONLINE
    </div>

  </div>

  {/* CHAT */}
  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">

    {chatMessages.map((msg, index) => (

      <div
        key={index}
        className={`
          p-4
          rounded-2xl
          max-w-[80%]
          ${
            msg.role === "assistant"
              ? "bg-zinc-800"
              : "bg-green-500 text-black ml-auto"
          }
        `}
      >

        {msg.text}

      </div>

    ))}

  </div>

  {/* INPUT */}
  <div className="flex gap-3">

    <input
      value={message}
      onChange={(e) =>
        setMessage(e.target.value)
      }
      placeholder="Pergunte para IA..."
      className="
        flex-1
        bg-zinc-800
        border
        border-zinc-700
        rounded-2xl
        px-5
        py-4
        outline-none
      "
    />

    <button
      onClick={handleSendMessage}
      className="
        bg-green-500
        hover:bg-green-400
        transition
        text-black
        px-6
        rounded-2xl
        font-bold
      "
    >
      Enviar
    </button>

  </div>

</div>

          {/* RANKING */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              🏆 Ranking de Links
            </h2>

            <div className="space-y-4">

              <div className="bg-zinc-800 rounded-2xl p-5 flex items-center justify-between">

                <div>
                  <p className="font-bold">
                    Bolsa Nike
                  </p>

                  <p className="text-sm text-gray-400">
                    245 cliques
                  </p>
                </div>

                <div className="text-green-400 font-bold">
                  +32%
                </div>

              </div>

              <div className="bg-zinc-800 rounded-2xl p-5 flex items-center justify-between">

                <div>
                  <p className="font-bold">
                    Creatina Growth
                  </p>

                  <p className="text-sm text-gray-400">
                    182 cliques
                  </p>
                </div>

                <div className="text-green-400 font-bold">
                  +21%
                </div>

              </div>

              <div className="bg-zinc-800 rounded-2xl p-5 flex items-center justify-between">

                <div>
                  <p className="font-bold">
                    Starlink Mini
                  </p>

                  <p className="text-sm text-gray-400">
                    120 cliques
                  </p>
                </div>

                <div className="text-green-400 font-bold">
                  +12%
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}