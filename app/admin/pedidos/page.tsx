"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Pedido {
  id: number;
  cliente: string | null;
  telefone: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  complemento: string | null;
  tipo_entrega: string | null;
  pagamento: string | null;
  troco: string | null;
  observacao: string | null;
  total: number;
  status: string;
  created_at: string;
}

interface ItemPedido {
  id: number;
  produto_id: number;
  quantidade: number;
  preco: number;
  produtos: {
    nome: string;
  };
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [novoStatus, setNovoStatus] = useState("");

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPedidos(data || []);
  }

  async function abrirDetalhes(pedido: Pedido) {
    setPedidoSelecionado(pedido);
    setNovoStatus(pedido.status);

    const { data, error } = await supabase
      .from("pedido_itens")
      .select("*, produtos(nome)")
      .eq("pedido_id", pedido.id);

    if (error) {
      console.error(error);
      return;
    }

    setItens(data || []);
  }

  async function atualizarStatus() {
    if (!pedidoSelecionado) return;

    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("id", pedidoSelecionado.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Status atualizado!");
    carregarPedidos();
    setPedidoSelecionado(null);
  }

  async function avisarCliente() {
    if (!pedidoSelecionado || !pedidoSelecionado.telefone) {
      alert("Telefone do cliente não disponível");
      return;
    }

    const mensagem = `🐶 *EA CASA DE RAÇÃO*

✅ Seu pedido Nº ${pedidoSelecionado.id} está PRONTO PARA RETIRADA!

📍 Endereço da Loja:
EA Casa de Ração
R. Queira Deus, 741 - Portão

📞 Telefone: (71) 99388-7651

⏰ Você pode retirar agora ou agendar um horário.

Obrigado pela preferência! 🐾`;

    const telefoneLoja = "5571993887651";

    window.open(
      `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );
  }

  async function excluirPedido() {
    if (!pedidoSelecionado) return;

    if (!confirm("Tem certeza que quer excluir este pedido?")) return;

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", pedidoSelecionado.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Pedido excluído!");
    carregarPedidos();
    setPedidoSelecionado(null);
  }

  async function imprimirPedido() {
    if (!pedidoSelecionado) return;

    const conteudo = `
EA CASA DE RAÇÃO
=====================================
PEDIDO Nº ${pedidoSelecionado.id}

CLIENTE: ${pedidoSelecionado.cliente}
TELEFONE: ${pedidoSelecionado.telefone}
TIPO: ${pedidoSelecionado.tipo_entrega}

ENDEREÇO:
${pedidoSelecionado.endereco}, ${pedidoSelecionado.numero}
${pedidoSelecionado.bairro}
${pedidoSelecionado.complemento || ""}

PAGAMENTO: ${pedidoSelecionado.pagamento}
TOTAL: R$ ${pedidoSelecionado.total.toFixed(2)}

PRODUTOS:
${itens.map((item) => `- ${item.produtos.nome} x${item.quantidade}: R$ ${item.preco.toFixed(2)}`).join("\n")}

STATUS: ${pedidoSelecionado.status}
DATA: ${new Date(pedidoSelecionado.created_at).toLocaleDateString("pt-BR")}
=====================================
    `;

    const novaJanela = window.open("", "_blank");
    if (novaJanela) {
      novaJanela.document.write(`<pre>${conteudo}</pre>`);
      novaJanela.print();
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Pedidos</h1>

      {pedidoSelecionado ? (
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6">Pedido #{pedidoSelecionado.id}</h2>

          <div className="space-y-4 mb-6">
            <p>
              <strong>Cliente:</strong> {pedidoSelecionado.cliente}
            </p>
            <p>
              <strong>Telefone:</strong> {pedidoSelecionado.telefone}
            </p>
            <p>
              <strong>Tipo:</strong> {pedidoSelecionado.tipo_entrega}
            </p>
            <p>
              <strong>Endereço:</strong> {pedidoSelecionado.endereco},{" "}
              {pedidoSelecionado.numero}
            </p>
            <p>
              <strong>Bairro:</strong> {pedidoSelecionado.bairro}
            </p>
            <p>
              <strong>Pagamento:</strong> {pedidoSelecionado.pagamento}
            </p>
            <p>
              <strong>Total:</strong> R$ {pedidoSelecionado.total.toFixed(2)}
            </p>
          </div>

          <h3 className="text-xl font-bold mb-4">Produtos</h3>
          <div className="space-y-2 mb-6">
            {itens.map((item) => (
              <div key={item.id} className="border rounded p-3">
                <p>
                  <strong>{item.produtos.nome}</strong>
                </p>
                <p>Quantidade: {item.quantidade}</p>
                <p>Preço: R$ {item.preco.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">Alterar Status</label>
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="w-full border rounded p-3"
            >
              <option value="PENDENTE">⏳ PENDENTE</option>
              <option value="CONFIRMADO">✅ CONFIRMADO</option>
              <option value="PRONTO PARA RETIRADA">📦 PRONTO PARA RETIRADA</option>
              <option value="ENTREGUE">🚚 ENTREGUE</option>
              <option value="CANCELADO">❌ CANCELADO</option>
            </select>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={avisarCliente}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              ✉️ Avisar Cliente
            </button>

            <button
              onClick={() => setNovoStatus(novoStatus)}
            >
              {/* Adicionado para compatibilidade */}
            </button>

            <button
              onClick={atualizarStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              💾 Salvar Status
            </button>

            <button
              onClick={imprimirPedido}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              🖨️ Imprimir
            </button>

            <button
              onClick={excluirPedido}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              🗑️ Excluir Pedido
            </button>

            <button
              onClick={() => setPedidoSelecionado(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
            >
              ← Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow">
          <table className="w-full">
            <thead className="bg-orange-100">
              <tr>
                <th className="p-4 text-left">Pedido</th>
                <th className="text-left">Cliente</th>
                <th className="text-left">Total</th>
                <th className="text-left">Status</th>
                <th className="text-left">Data</th>
                <th className="text-center">Ação</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-t hover:bg-orange-50">
                    <td className="p-3 font-bold">#{pedido.id}</td>
                    <td>{pedido.cliente}</td>
                    <td className="font-bold text-green-600">
                      R$ {pedido.total.toFixed(2)}
                    </td>
                    <td>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {pedido.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => abrirDetalhes(pedido)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
