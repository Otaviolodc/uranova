"use client";

import { supabase }
from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {

  const [message, setMessage] =
    useState("");

  const [aiResponse, setAiResponse] =
    useState("");

  const [views, setViews] = useState(0);

  const [growth, setGrowth] =
    useState(0);

  const [viralProduct, setViralProduct] =
    useState<any>(null);

  const [aiInsights, setAiInsights] =
    useState<string[]>([]);

  const [topProducts, setTopProducts] =
  useState<any[]>([]);

  const [heatmapData, setHeatmapData] =
  useState<any[]>([]);

  async function fetchAnalytics() {

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

  // CRESCIMENTO REAL

const today = new Date();

const todayViews =
  analyticsData?.filter((item) => {

    const itemDate =
      new Date(item.created_at);

    return (
      itemDate.getDate() ===
      today.getDate()
    );

  }).length || 0;

const yesterday = new Date();

yesterday.setDate(
  yesterday.getDate() - 1
);

const yesterdayViews =
  analyticsData?.filter((item) => {

    const itemDate =
      new Date(item.created_at);

    return (
      itemDate.getDate() ===
      yesterday.getDate()
    );

  }).length || 0;

let growthPercent = 0;

if (yesterdayViews > 0) {

  growthPercent =
    (
      (
        todayViews -
        yesterdayViews
      ) /
      yesterdayViews
    ) * 100;

}

setGrowth(
  Math.round(growthPercent)
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

// AGRUPAR POR HORÁRIO

const groupedHours: any = {};

analyticsData?.forEach((item) => {

  const hour =
    new Date(item.created_at)
      .getHours();

  if (!groupedHours[hour]) {
    groupedHours[hour] = 0;
  }

  groupedHours[hour]++;

});

const formattedHeatmap =
  Object.entries(groupedHours).map(
    ([hour, total]) => {

      let level = 1;

      if (Number(total) >= 20) {
        level = 5;
      } else if (Number(total) >= 15) {
        level = 4;
      } else if (Number(total) >= 10) {
        level = 3;
      } else if (Number(total) >= 5) {
        level = 2;
      }

      return {
        hour: `${hour}h`,
        level,
        total,
      };

    }
  );

setHeatmapData(formattedHeatmap);

  // AGRUPAR PRODUTOS
  const grouped: any = {};

  analyticsData?.forEach((item) => {

    if (!grouped[item.product_id]) {
      grouped[item.product_id] = 0;
    }

    grouped[item.product_id]++;

  });

  const ranking =Object.entries(grouped)
    .map(([id, total]) => ({
      id,
      total,
    }))
    .sort((a: any, b: any) => b.total - a.total);

    // 🤖 gerar insights IA

const insights = [];

if (views < 10) {

  insights.push(
    "📢 Compartilhe seus links no Instagram e TikTok para aumentar alcance."
  );

}

if (viralProducts.length === 0) {

  insights.push(
    "🖼️ Links com imagem tendem a gerar mais cliques."
  );

}

// crescimento
if (growth > 20) {

  insights.push(
    `🔥 Seu tráfego cresceu ${growth}% hoje.`
  );

}

// produto viral
if (ranking[0]) {

  insights.push(
    `🚀 Seu link mais acessado está ganhando destaque hoje.`
  );

}

// total clicks
if (views > 50) {

  insights.push(
    `📈 Sua página está recebendo bastante tráfego hoje.`
  );

}

// horário
if (heatmapData.length > 0) {

  const bestHour =
    heatmapData.sort(
      (a, b) =>
        b.total - a.total
    )[0];

  insights.push(
    `⏰ Seu melhor horário atual é ${bestHour.hour}.`
  );

}

setAiInsights(insights);


    // PEGAR PRODUTOS REAIS

const productIds =
  ranking.map((item: any) => item.id);

const { data: productsData } =
  await supabase
    .from("products_checkout")
    .select("*")
    .in("id", productIds);

const finalRanking =
  ranking.map((rank: any) => {

    const product =
      productsData?.find(
        (p) => p.id === rank.id
      );

    return {
      ...rank,
      title:
        product?.title ||
        "Produto",
      price:
        product?.price || 0,
    };

  });

  setViralProducts(finalRanking);

  // PRODUTO VIRAL

if (finalRanking.length > 0) {

  setViralProduct(
    finalRanking[0]
  );

}

  setTopProducts(finalRanking);

  console.log(ranking)

  }
  
useEffect(() => {

  fetchAnalytics();

}, []);

  const [chartData, setChartData] =
  useState<any[]>([]);

const [viralProducts, setViralProducts] =
  useState<any[]>([]);

const conversionRate =
  views > 0
    ? (
        (
          viralProducts.length /
          views
        ) * 100
      ).toFixed(1)
    : "0";

const estimatedRevenue =
  Math.floor(
    views * 0.08 * 69
  );

let scoreIA = 0;

if (views >= 10)
  scoreIA += 20;

if (views >= 50)
  scoreIA += 20;

if (viralProducts.length >= 1)
  scoreIA += 20;

if (growth > 0)
  scoreIA += 20;

if (heatmapData.length > 5)
  scoreIA += 20;

const radarData = [

  {
    name: "Conversão",
    value: Math.min(
      100,
      Math.floor(
        Number(conversionRate) * 20
      )
    ),
  },

  {
    name: "Engajamento",
    value: Math.min(
      100,
      views
    ),
  },

  {
    name: "CTR",
    value: Math.min(
      100,
      growth + 50
    ),
  },

  {
    name: "Potencial Viral",
    value: Math.min(
      100,
      viralProducts.length * 25
    ),
  },

  {
    name: "Performance",
    value: scoreIA,
  },

];

  const handleSendMessage = async () => {

  if (!message) return;

  try {

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
            message,
          }),
        }
      );

    const data =
      await response.json();

    setAiResponse(
      data.message
    );

  } catch (error) {

    console.log(error);

    setAiResponse(
      "Erro ao responder IA"
    );

  }

};

return (

    <div className="flex bg-black text-white min-h-screen">
         
      <div className="flex-1 p-4 md:p-8 pt-20 md:pt-8">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-2xl md:text-4xl font-black">
            ⚡ Centro de IA e Performance
          </h1>

          <p className="text-gray-400 mt-2 text-lg">
            Analytics inteligente para aumentar cliques e conversões
          </p>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-10">

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
            {product.title}
          </h3>
        </div>

        <div className="text-green-400 font-black text-2xl">
          {product.total} views
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

            <h2 className="text-2xl md:text-4xl font-black text-green-400 mt-3">
              R$ {estimatedRevenue}
            </h2>

            <p className="text-green-400 text-sm mt-2">
              {growth > 0
                ? `+${growth}% hoje`
                : "Sem crescimento hoje"}
            </p>

          </div>

          {/* VISITANTES */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

            <p className="text-gray-400 text-sm">
              👀 Visitantes Hoje
            </p>

            <h2 className="text-2xl md:text-4xl font-black mt-3">
              {views}
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

            <h2 className="text-2xl md:text-4xl font-black mt-3">
              {conversionRate}%
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

            <h2 className="text-2xl md:text-4xl font-black mt-3 text-green-400">
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
              {growth > 0 ? "+" : ""}
              {growth}%
            </div>

          </div>

          {/* BARRAS */}
          <div className="h-72">

  <ResponsiveContainer width="100%" height={300}>

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

        {/* PRODUTO VIRAL */}
        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-8
          mb-10
        ">

  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

    <div>

      <p className="text-green-400 font-bold">
        🔥 PRODUTO VIRAL DO DIA
      </p>

      <h2 className="text-2xl md:text-3xl font-black mt-3 break-words">

        {viralProduct?.title ||
          "Nenhum produto"}

      </h2>

      <p className="text-zinc-400 mt-2">
        Link com maior volume de acessos e potencial de conversão
      </p>

    </div>

    <div className="
      bg-green-500
      text-black
      px-6
      py-4
      rounded-2xl
      font-black
      text-2xl
    ">

      {viralProduct?.total || 0}

    </div>

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

  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">

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

  {aiInsights.map(
    (insight, index) => (

    <div
      key={index}
      className="
        bg-zinc-900
        border
        border-green-500/20
        rounded-3xl
        p-5
      "
    >

      <p className="
        text-lg
        text-white
      ">

        {insight}

      </p>

    </div>

  ))}

</div>

  {/* MELHOR HORÁRIO */}

  <div className="
    bg-zinc-800
    rounded-2xl
    p-5
  ">

    <p className="
      text-green-400
      font-semibold
      mb-2
    ">
      ⏰ Melhor Horário
    </p>

    <p className="text-lg">

      {heatmapData.length > 0
        ? `Seu horário mais forte é ${heatmapData.sort((a, b) => b.total - a.total)[0]?.hour}.`
        : "Ainda analisando horários."}

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
        Assistente inteligente de performance e conversão
      </p>

    </div>

    <div className="text-green-400 font-bold">
      ONLINE
    </div>

  </div>

{/* RESPOSTA IA */}

{aiResponse && (

  <div className="
    mt-5
    bg-zinc-900
    border
    border-green-500/30
    rounded-3xl
    p-5
    text-zinc-200
    leading-relaxed
  ">

    {aiResponse}

  </div>

)}

  {/* INPUT */}
  <div className="flex flex-col md:flex-row gap-3">

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
        w-full md:w-auto
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
          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-6">
              🏆 Ranking de Links
            </h2>

          <div className="space-y-4">

              {topProducts
                .slice(0, 5)
                .map((product: any, index) => (

          <div
            key={product.id}
            className="
              bg-zinc-800
              rounded-2xl
              p-5
              flex
              flex-col
              md:flex-row
              gap-3
              items-start
              md:items-center
              justify-between
            "
          >

          <div>

           <p className="font-bold">
             #{index + 1} {product.title}
           </p>

           <p className="text-sm text-gray-400">
             {product.total} cliques
           </p>

          </div>

          <div className="text-green-400 font-bold">
            +{Math.floor(
              product.total * 0.12
            )}%
          </div>

        </div>

    ))}

            </div>

          </div>

        </div>

      </div>

  );

}
