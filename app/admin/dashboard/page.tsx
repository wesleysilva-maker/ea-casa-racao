"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {

  const [produtos, setProdutos] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [pendentes, setPendentes] = useState(0);
  const [preparo, setPreparo] = useState(0);
  const [entrega, setEntrega] = useState(0);
  const [entregues, setEntregues] = useState(0);

  const [faturamentoHoje, setFaturamentoHoje] = useState(0);
  const [faturamentoMes, setFaturamentoMes] = useState(0);

  async function carregarDashboard() {

    const hoje = new Date();

    const inicioHoje = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    ).toISOString();

    const inicioMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    ).toISOString();

    const { count: totalProdutos } = await supabase
      .from("produtos")
      .select("*", {
        count: "exact",
        head: true,
      });

    setProdutos(totalProdutos || 0);

    const { count: totalPedidos } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      });

    setPedidos(totalPedidos || 0);

    const { count: totalPendentes } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "PENDENTE");

    setPendentes(totalPendentes || 0);

    const { count: totalPreparo } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "EM PREPARO");

    setPreparo(totalPreparo || 0);

    const { count: totalEntrega } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "SAIU PARA ENTREGA");

    setEntrega(totalEntrega || 0);

    const { count: totalEntregues } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "ENTREGUE");

    setEntregues(totalEntregues || 0);

    const { data: hojePedidos } = await supabase
      .from("pedidos")
      .select("total")
      .neq("status", "CANCELADO")
      .gte("created_at", inicioHoje);

    let totalHoje = 0;

    hojePedidos?.forEach((pedido) => {
      totalHoje += Number(pedido.total);
    });

    setFaturamentoHoje(totalHoje);

    const { data: mesPedidos } = await supabase
      .from("pedidos")
      .select("total")
      .neq("status", "CANCELADO")
      .gte("created_at", inicioMes);

    let totalMes = 0;

    mesPedidos?.forEach((pedido) => {
      totalMes += Number(pedido.total);
    });

    setFaturamentoMes(totalMes);

  }
  useEffect(() => {

    carregarDashboard();

    const channel = supabase
      .channel("dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        () => {
          carregarDashboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  return (

    <main className="min-h-screen bg-gray-100">

      <header className="bg-orange-500 text-white p-6 shadow-lg">

        <h1 className="text-3xl font-bold">
          Painel Administrativo
        </h1>

      </header>

      <div className="max-w-7xl mx-auto p-8">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-gray-500">
              Produtos
            </h2>

            <p className="text-4xl font-black mt-3">
              {produtos}
            </p>

          </div>

          <div className="bg-indigo-50 rounded-xl shadow p-6">

            <h2 className="text-indigo-700 font-semibold">
              Total de Pedidos
            </h2>

            <p className="text-4xl font-black mt-3 text-indigo-700">
              {pedidos}
            </p>

          </div>

          <div className="bg-red-50 rounded-xl shadow p-6">

            <h2 className="text-red-600 font-semibold">
              Pendentes
            </h2>

            <p className="text-4xl font-black mt-3 text-red-700">
              {pendentes}
            </p>

          </div>

          <div className="bg-yellow-50 rounded-xl shadow p-6">

            <h2 className="text-yellow-700 font-semibold">
              Em Preparo
            </h2>

            <p className="text-4xl font-black mt-3 text-yellow-700">
              {preparo}
            </p>

          </div>

          <div className="bg-blue-50 rounded-xl shadow p-6">

            <h2 className="text-blue-700 font-semibold">
              Saiu para Entrega
            </h2>

            <p className="text-4xl font-black mt-3 text-blue-700">
              {entrega}
            </p>

          </div>

          <div className="bg-green-50 rounded-xl shadow p-6">

            <h2 className="text-green-700 font-semibold">
              Entregues
            </h2>

            <p className="text-4xl font-black mt-3 text-green-700">
              {entregues}
            </p>

          </div>

          <div className="bg-emerald-100 rounded-xl shadow p-6">

            <h2 className="text-green-800 font-semibold">
              Faturamento Hoje
            </h2>

            <p className="text-4xl font-black mt-3 text-green-700">
              R$ {faturamentoHoje.toFixed(2)}
            </p>

          </div>

          <div className="bg-emerald-200 rounded-xl shadow p-6">

            <h2 className="text-green-900 font-semibold">
              Faturamento do Mês
            </h2>

            <p className="text-4xl font-black mt-3 text-green-800">
              R$ {faturamentoMes.toFixed(2)}
            </p>

          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
              Resumo Geral
            </h2>

            <div className="space-y-3 text-lg">

              <p>
                📦 Produtos: <strong>{produtos}</strong>
              </p>

              <p>
                🛒 Pedidos: <strong>{pedidos}</strong>
              </p>

              <p>
                🔴 Pendentes: <strong>{pendentes}</strong>
              </p>

              <p>
                🟡 Em preparo: <strong>{preparo}</strong>
              </p>

              <p>
                🔵 Em entrega: <strong>{entrega}</strong>
              </p>

              <p>
                🟢 Entregues: <strong>{entregues}</strong>
              </p>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
              Financeiro
            </h2>

            <div className="space-y-4">

              <div>

                <p className="text-gray-500">
                  Hoje
                </p>

                <p className="text-3xl font-black text-green-700">
                  R$ {faturamentoHoje.toFixed(2)}
                </p>

              </div>

              <div>

                <p className="text-gray-500">
                  Este mês
                </p>

                <p className="text-3xl font-black text-green-700">
                  R$ {faturamentoMes.toFixed(2)}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  );

}