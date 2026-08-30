"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type AnalyticsItem = {
  created_at: string;
  product_id: string | null;
};

type ProductRanking = {
  id: string;
  title: string;
  price: number;
  total: number;
};

type ChartItem = {
  day: string;
  clicks: number;
};

type HeatmapItem = {
  hour: string;
  level: number;
  total: number;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<
    AnalyticsItem[]
  >([]);

  const [topProducts, setTopProducts] = useState<
    ProductRanking[]
  >([]);

  const [chartData, setChartData] = useState<ChartItem[]>([]);

  const [heatmapData, setHeatmapData] = useState<
    HeatmapItem[]
  >([]);

  const [message, setMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | BUSCAR ANALYTICS
  |--------------------------------------------------------------------------
  */

  async function fetchAnalytics() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase
      .from("analytics")
      .select(`
        created_at,
        product_id
      `)
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Erro ao buscar analytics:",
        error
      );

      setLoading(false);
      return;
    }

    const analytics = data || [];

    setAnalyticsData(analytics);

    /*
    |--------------------------------------------------------------------------
    | GRÁFICO - ÚLTIMOS 7 DIAS
    |--------------------------------------------------------------------------
    */

    const today = new Date();

    const last7Days = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(today);

        date.setDate(
          today.getDate() - (6 - index)
        );

        return date;
      }
    );

    const formattedChart: ChartItem[] =
      last7Days.map((date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const clicks = analytics.filter((item) => {
          const itemDate = new Date(
            item.created_at
          );

          return (
            itemDate >= dayStart &&
            itemDate <= dayEnd
          );
        }).length;

        return {
          day: date.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
          }),
          clicks,
        };
      });

    setChartData(formattedChart);

    /*
    |--------------------------------------------------------------------------
    | HORÁRIOS
    |--------------------------------------------------------------------------
    */

    const groupedHours: Record<
      number,
      number
    > = {};

    analytics.forEach((item) => {
      const hour = new Date(
        item.created_at
      ).getHours();

      groupedHours[hour] =
        (groupedHours[hour] || 0) + 1;
    });

    const formattedHeatmap: HeatmapItem[] =
      Object.entries(groupedHours)
        .map(([hour, total]) => {
          let level = 1;

          if (total >= 20) {
            level = 5;
          } else if (total >= 15) {
            level = 4;
          } else if (total >= 10) {
            level = 3;
          } else if (total >= 5) {
            level = 2;
          }

          return {
            hour: `${hour}h`,
            level,
            total,
          };
        })
        .sort(
          (a, b) =>
            Number(a.hour.replace("h", "")) -
            Number(b.hour.replace("h", ""))
        );

    setHeatmapData(formattedHeatmap);

    /*
    |--------------------------------------------------------------------------
    | PRODUTOS MAIS ACESSADOS
    |--------------------------------------------------------------------------
    */

    const groupedProducts: Record<
      string,
      number
    > = {};

    analytics.forEach((item) => {
      if (!item.product_id) return;

      groupedProducts[item.product_id] =
        (groupedProducts[item.product_id] || 0) + 1;
    });

    const productRanking = Object.entries(
      groupedProducts
    )
      .map(([id, total]) => ({
        id,
        total,
      }))
      .sort(
        (a, b) => b.total - a.total
      );

    if (productRanking.length === 0) {
      setTopProducts([]);
      setLoading(false);
      return;
    }

    const productIds =
      productRanking.map(
        (product) => product.id
      );

    const {
      data: productsData,
      error: productsError,
    } = await supabase
      .from("products_checkout")
      .select(`
        id,
        title,
        price
      `)
      .in("id", productIds);

    if (productsError) {
      console.error(
        "Erro ao buscar produtos:",
        productsError
      );

      setLoading(false);
      return;
    }

    const finalRanking: ProductRanking[] =
      productRanking.map((rank) => {
        const product =
          productsData?.find(
            (item) => item.id === rank.id
          );

        return {
          id: rank.id,
          title:
            product?.title ||
            "Produto",
          price:
            Number(product?.price) || 0,
          total: rank.total,
        };
      });

    setTopProducts(finalRanking);

    setLoading(false);
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | MÉTRICAS
  |--------------------------------------------------------------------------
  */

  const totalViews =
    analyticsData.length;

  const todayViews = useMemo(() => {
    const today = new Date();

    return analyticsData.filter(
      (item) => {
        const date = new Date(
          item.created_at
        );

        return (
          date.getDate() ===
            today.getDate() &&
          date.getMonth() ===
            today.getMonth() &&
          date.getFullYear() ===
            today.getFullYear()
        );
      }
    ).length;
  }, [analyticsData]);

  const yesterdayViews = useMemo(() => {
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    return analyticsData.filter(
      (item) => {
        const date = new Date(
          item.created_at
        );

        return (
          date.getDate() ===
            yesterday.getDate() &&
          date.getMonth() ===
            yesterday.getMonth() &&
          date.getFullYear() ===
            yesterday.getFullYear()
        );
      }
    ).length;
  }, [analyticsData]);

  const growth = useMemo(() => {
    if (yesterdayViews === 0) {
      return todayViews > 0 ? 100 : 0;
    }

    return Math.round(
      ((todayViews - yesterdayViews) /
        yesterdayViews) *
        100
    );
  }, [todayViews, yesterdayViews]);

  const bestHour = useMemo(() => {
    if (heatmapData.length === 0) {
      return null;
    }

    return [...heatmapData].sort(
      (a, b) => b.total - a.total
    )[0];
  }, [heatmapData]);

  /*
  |--------------------------------------------------------------------------
  | RECOMENDAÇÕES DA IA
  |--------------------------------------------------------------------------
  */

  const aiInsights = useMemo(() => {
    const insights: string[] = [];

    if (totalViews === 0) {
      insights.push(
        "Comece divulgando seus links para gerar os primeiros acessos."
      );
    }

    if (
      totalViews > 0 &&
      totalViews < 10
    ) {
      insights.push(
        "Seu tráfego ainda está começando. Divulgue seus produtos nas redes sociais para aumentar o alcance."
      );
    }

    if (growth > 20) {
      insights.push(
        `Seu tráfego cresceu ${growth}% em relação a ontem. Aproveite o momento para divulgar seus produtos.`
      );
    }

    if (
      growth < 0 &&
      totalViews > 0
    ) {
      insights.push(
        "Os acessos diminuíram em relação a ontem. Vale reforçar a divulgação dos seus links."
      );
    }

    if (topProducts.length > 0) {
      insights.push(
        `O produto "${topProducts[0].title}" é atualmente o mais acessado da sua operação.`
      );
    }

    if (bestHour) {
      insights.push(
        `Seu maior volume de acessos acontece por volta das ${bestHour.hour}.`
      );
    }

    if (insights.length === 0) {
      insights.push(
        "Continue acompanhando seus acessos para que a Uranova possa identificar novos padrões de performance."
      );
    }

    return insights.slice(0, 4);
  }, [
    totalViews,
    growth,
    topProducts,
    bestHour,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CHAT IA
  |--------------------------------------------------------------------------
  */

  async function handleSendMessage() {
    if (!message.trim()) return;

    setAiLoading(true);
    setAiResponse("");

    try {
      const response = await fetch(
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
        data.message ||
          "Não foi possível obter uma resposta da IA."
      );

      setMessage("");
    } catch (error) {
      console.error(
        "Erro ao consultar IA:",
        error
      );

      setAiResponse(
        "Ocorreu um erro ao consultar a IA Uranova."
      );
    } finally {
      setAiLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 md:p-8 pt-20 md:pt-8">

        {/* ================================================================
            HEADER ANALYTICS
        ================================================================= */}

        <div className="mb-10">

          <h1 className="
            text-3xl
            font-bold
            text-white
          ">
            Analytics
          </h1>

          <p className="
            text-zinc-400
            mt-3
            text-base
            md:text-lg
            max-w-2xl
          ">
            Analise seus acessos, descubra
            oportunidades e tome decisões
            melhores para seus produtos.
          </p>

        </div>

        {/* ================================================================
            VISÃO GERAL
        ================================================================= */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
          mb-10
        ">

          {/* ACESSOS */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <p className="text-zinc-400">
                Acessos totais
              </p>

              <span className="text-xl">
                👁️
              </span>

            </div>

            <h2 className="
              text-4xl
              font-black
              mt-4
            ">
              {totalViews}
            </h2>

            <p className="
              text-zinc-500
              text-sm
              mt-2
            ">
              Visualizações registradas
            </p>

          </div>

          {/* HOJE */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <p className="text-zinc-400">
                Acessos hoje
              </p>

              <span className="text-xl">
                📈
              </span>

            </div>

            <h2 className="
              text-4xl
              font-black
              text-green-400
              mt-4
            ">
              {todayViews}
            </h2>

            <p className="
              text-sm
              mt-2
              text-zinc-500
            ">
              {growth > 0
                ? `+${growth}% em relação a ontem`
                : growth < 0
                ? `${growth}% em relação a ontem`
                : "Sem alteração em relação a ontem"}
            </p>

          </div>

          {/* MELHOR HORÁRIO */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <p className="text-zinc-400">
                Melhor horário
              </p>

              <span className="text-xl">
                ⏰
              </span>

            </div>

            <h2 className="
              text-4xl
              font-black
              text-green-400
              mt-4
            ">
              {bestHour?.hour || "--"}
            </h2>

            <p className="
              text-zinc-500
              text-sm
              mt-2
            ">
              Horário com mais acessos
            </p>

          </div>

        </div>

        {/* ================================================================
            IA RECOMENDAÇÕES
        ================================================================= */}

        <div className="
          bg-zinc-900
          border
          border-green-500/20
          rounded-3xl
          p-6
          md:p-8
          mb-10
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          ">

            <div>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-green-500/10
                  border
                  border-green-500/20
                  flex
                  items-center
                  justify-center
                  text-xl
                ">
                  🧠
                </div>

                <div>

                  <h2 className="
                    text-2xl
                    font-black
                  ">
                    Recomendações da IA
                  </h2>

                  <p className="
                    text-zinc-500
                    text-sm
                    mt-1
                  ">
                    Insights baseados nos
                    seus dados
                  </p>

                </div>

              </div>

            </div>

            <span className="
              text-green-400
              text-sm
              font-bold
            ">
              IA Uranova
            </span>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          ">

            {aiInsights.map(
              (insight, index) => (

                <div
                  key={index}
                  className="
                    bg-black/30
                    border
                    border-zinc-800
                    rounded-2xl
                    p-5
                    hover:border-green-500/30
                    transition
                  "
                >

                  <div className="
                    flex
                    gap-3
                    items-start
                  ">

                    <span className="
                      text-green-400
                      font-black
                    ">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <p className="
                      text-zinc-200
                      leading-relaxed
                    ">
                      {insight}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* ================================================================
            GRÁFICO
        ================================================================= */}

        <div className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-6
          md:p-8
          mb-10
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-3
            mb-8
          ">

            <div>

              <h2 className="
                text-2xl
                font-black
              ">
                📈 Crescimento de acessos
              </h2>

              <p className="
                text-zinc-500
                mt-1
              ">
                Últimos 7 dias
              </p>

            </div>

            <div className="
              px-4
              py-2
              rounded-full
              bg-zinc-800
              text-zinc-300
              text-sm
            ">
              {totalViews} acessos
            </div>

          </div>

          <div className="
            w-full
            h-[300px]
          ">

            {loading ? (

              <div className="
                h-full
                flex
                items-center
                justify-center
                text-zinc-500
              ">
                Carregando dados...
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    stroke="#27272a"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#71717a"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#18181b",
                      border:
                        "1px solid #27272a",
                      borderRadius:
                        "12px",
                      color: "#fff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Acessos"
                    stroke="#00ff66"
                    strokeWidth={4}
                    dot={{
                      r: 4,
                      fill: "#00ff66",
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* ================================================================
            PRODUTOS + HORÁRIOS
        ================================================================= */}

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-8
          mb-10
        ">

          {/* PRODUTOS */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
            md:p-8
          ">

            <div className="mb-6">

              <h2 className="
                text-2xl
                font-black
              ">
                🔥 Produtos mais acessados
              </h2>

              <p className="
                text-zinc-500
                mt-1
              ">
                Produtos que estão recebendo
                mais atenção
              </p>

            </div>

            {topProducts.length === 0 ? (

              <div className="
                py-10
                text-center
                text-zinc-500
              ">
                Ainda não existem dados
                suficientes.
              </div>

            ) : (

              <div className="space-y-3">

                {topProducts
                  .slice(0, 5)
                  .map(
                    (product, index) => (

                      <div
                        key={product.id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          bg-black/30
                          border
                          border-zinc-800
                          rounded-2xl
                          p-4
                        "
                      >

                        <div className="
                          flex
                          items-center
                          gap-4
                          min-w-0
                        ">

                          <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-zinc-800
                            flex
                            items-center
                            justify-center
                            font-black
                            text-zinc-400
                          ">
                            {index + 1}
                          </div>

                          <div className="min-w-0">

                            <p className="
                              font-bold
                              truncate
                            ">
                              {product.title}
                            </p>

                            <p className="
                              text-zinc-500
                              text-sm
                              mt-1
                            ">
                              R$ {product.price.toFixed(
                                2
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="
                          text-green-400
                          font-black
                          whitespace-nowrap
                        ">
                          {product.total} acessos
                        </div>

                      </div>

                    )
                  )}

              </div>

            )}

          </div>

          {/* HORÁRIOS */}

          <div className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
            md:p-8
          ">

            <div className="
              flex
              items-start
              justify-between
              gap-4
              mb-6
            ">

              <div>

                <h2 className="
                  text-2xl
                  font-black
                ">
                  ⏰ Horários de maior atividade
                </h2>

                <p className="
                  text-zinc-500
                  mt-1
                ">
                  Quando seus links recebem
                  mais acessos
                </p>

              </div>

              {bestHour && (

                <div className="
                  text-green-400
                  font-black
                  whitespace-nowrap
                ">
                  {bestHour.hour}
                </div>

              )}

            </div>

            {heatmapData.length === 0 ? (

              <div className="
                py-10
                text-center
                text-zinc-500
              ">
                Ainda não existem dados
                suficientes.
              </div>

            ) : (

              <div className="
                grid
                grid-cols-3
                sm:grid-cols-4
                gap-3
              ">

                {heatmapData.map(
                  (item) => (

                    <div
                      key={item.hour}
                      className={`
                        rounded-2xl
                        p-4
                        text-center
                        border
                        transition
                        ${
                          item.level >= 5
                            ? "bg-green-500 text-black border-green-400"
                            : item.level >= 4
                            ? "bg-green-500/30 text-white border-green-500/40"
                            : item.level >= 3
                            ? "bg-green-500/10 text-white border-green-500/20"
                            : item.level >= 2
                            ? "bg-zinc-800 text-white border-zinc-700"
                            : "bg-zinc-900 text-zinc-500 border-zinc-800"
                        }
                      `}
                    >

                      <p className="
                        font-black
                      ">
                        {item.hour}
                      </p>

                      <p className="
                        text-xs
                        mt-1
                        opacity-80
                      ">
                        {item.total} acessos
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* ================================================================
            CHAT IA
        ================================================================= */}

        <div className="
          relative
          overflow-hidden
          bg-zinc-900
          border
          border-green-500/30
          rounded-3xl
          p-6
          md:p-8
        ">

          <div className="
            absolute
            -top-24
            -right-24
            w-64
            h-64
            bg-green-500/10
            blur-3xl
            rounded-full
          " />

          <div className="
            relative
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          ">

            <div>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-green-500
                  text-black
                  flex
                  items-center
                  justify-center
                  text-2xl
                ">
                  🤖
                </div>

                <div>

                  <h2 className="
                    text-2xl
                    md:text-3xl
                    font-black
                  ">
                    IA Uranova
                  </h2>

                  <p className="
                    text-zinc-400
                    mt-1
                  ">
                    Assistente inteligente de
                    performance e conversão
                  </p>

                </div>

              </div>

            </div>

            <span className="
              text-green-400
              font-bold
              text-sm
            ">
              ONLINE
            </span>

          </div>

          {/* RESPOSTA */}

          {aiResponse && (

            <div className="
              relative
              mb-5
              bg-black/40
              border
              border-green-500/20
              rounded-2xl
              p-5
              text-zinc-200
              leading-relaxed
            ">
              {aiResponse}
            </div>

          )}

          {/* INPUT */}

          <div className="
            relative
            flex
            flex-col
            md:flex-row
            gap-3
          ">

            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Pergunte à IA sobre seus produtos, acessos ou vendas..."
              className="
                flex-1
                bg-black/40
                border
                border-zinc-700
                rounded-2xl
                px-5
                py-4
                text-white
                placeholder:text-zinc-600
                outline-none
                focus:border-green-500
                transition
              "
            />

            <button
              type="button"
              onClick={
                handleSendMessage
              }
              disabled={
                aiLoading ||
                !message.trim()
              }
              className="
                md:w-auto
                px-7
                py-4
                rounded-2xl
                bg-green-500
                hover:bg-green-400
                disabled:bg-zinc-700
                disabled:text-zinc-500
                disabled:cursor-not-allowed
                text-black
                font-black
                transition
              "
            >
              {aiLoading
                ? "Analisando..."
                : "Perguntar à IA"}
            </button>

          </div>

          <p className="
            relative
            text-zinc-600
            text-xs
            mt-3
          ">
            A IA Uranova pode ajudar a
            interpretar seus dados e sugerir
            estratégias.
          </p>

        </div>

      </div>
    </div>
  );
}