"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [produtos, setProdutos] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [clientes, setClientes] = useState(0);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    // Produtos
    const { count: totalProdutos } = await supabase
      .from("produtos")
      .select("*", {
        count: "exact",
        head: true,
      });

    setProdutos(totalProdutos || 0);

    // Pedidos
    const { count: totalPedidos } = await supabase
      .from("pedidos")
      .select("*", {
        count: "exact",
        head: true,
      });

    setPedidos(totalPedidos || 0);

    // Clientes (caso a tabela exista)
    const { count: totalClientes } = await supabase
      .from("clientes")
      .select("*", {
        count: "exact",
        head: true,
      });

    setClientes(totalClientes || 0);
  }

  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold text-orange-600 mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-lg">
            Produtos
          </p>

          <h2 className="text-5xl font-black text-orange-600 mt-3">
            {produtos}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-lg">
            Pedidos
          </p>

          <h2 className="text-5xl font-black text-blue-600 mt-3">
            {pedidos}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-lg">
            Clientes
          </p>

          <h2 className="text-5xl font-black text-green-600 mt-3">
            {clientes}
          </h2>
        </div>

      </div>

      <div className="mt-10 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">
          Resumo do Sistema
        </h2>

        <div className="space-y-3 text-lg">

          <p>
            📦 Total de Produtos: <strong>{produtos}</strong>
          </p>

          <p>
            🛒 Total de Pedidos: <strong>{pedidos}</strong>
          </p>

          <p>
            👥 Total de Clientes: <strong>{clientes}</strong>
          </p>

        </div>
      </div>

    </div>
  );
}