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
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<number | null>(null);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [status, setStatus] = useState("");
  const [ultimoPedido, setUltimoPedido] = useState(0);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPedidos(data || []);

    if (data && data.length > 0) {
      if (ultimoPedido !== 0 && data[0].id > ultimoPedido) {
        alert(`🔔 Novo Pedido #${data[0].id}`);
      }

      setUltimoPedido(data[0].id);
    }
  }

  async function abrirPedido(id: number) {
    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", id)
      .single();

    if (erroPedido) {
      alert(erroPedido.message);
      return;
    }

    const { data, error } = await supabase
      .from("pedido_itens")
      .select(`
        id,
        produto_id,
        quantidade,
        preco,
        produtos!pedido_itens_produto_id_fkey(
          nome
        )
      `)
      .eq("pedido_id", id);

    if (error) {
      alert(error.message);
      return;
    }

   console.log(data);
console.log(JSON.stringify(data, null, 2));

    setPedidoAtual(pedido);
    setStatus(pedido.status);
    setItens((data ?? []).map((item: any) => ({
  ...item,
  produtos: Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos,
})));

    setPedidoSelecionado(id);
    setModalOpen(true);
  }
  async function salvarStatus() {
    if (!pedidoSelecionado) return;

    if (
      pedidoAtual &&
      pedidoAtual.status !== "ENTREGUE" &&
      status === "ENTREGUE"
    ) {
      const { data: itensPedido, error: erroItens } = await supabase
        .from("pedido_itens")
        .select("produto_id, quantidade")
        .eq("pedido_id", pedidoSelecionado);

      if (erroItens) {
        alert(erroItens.message);
        return;
      }

      for (const item of itensPedido || []) {
        const { data: produto, error: erroProduto } = await supabase
          .from("produtos")
          .select("id, estoque")
          .eq("id", item.produto_id)
          .single();

        if (erroProduto || !produto) continue;

        const novoEstoque = Math.max(
          0,
          Number(produto.estoque) - Number(item.quantidade)
        );

        const { error: erroAtualizar } = await supabase
          .from("produtos")
          .update({
            estoque: novoEstoque,
          })
          .eq("id", produto.id);

        if (erroAtualizar) {
          alert(erroAtualizar.message);
          return;
        }
      }
    }

    const { error } = await supabase
      .from("pedidos")
      .update({
        status,
      })
      .eq("id", pedidoSelecionado);

    if (error) {
      alert(error.message);
      return;
    }

    await carregarPedidos();

    if (pedidoAtual) {
      setPedidoAtual({
        ...pedidoAtual,
        status,
      });
    }

    alert("Status atualizado.");
  }

  async function excluirPedido() {
    if (!pedidoSelecionado) return;

    if (!confirm("Deseja realmente excluir este pedido?")) {
      return;
    }

    const { error: erroItens } = await supabase
      .from("pedido_itens")
      .delete()
      .eq("pedido_id", pedidoSelecionado);

    if (erroItens) {
      alert(erroItens.message);
      return;
    }

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", pedidoSelecionado);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Pedido excluído.");

    setModalOpen(false);
    setPedidoAtual(null);
    setItens([]);
    setPedidoSelecionado(null);

    carregarPedidos();
  }

  useEffect(() => {
    carregarPedidos();

    const channel = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
        },
        () => {
          carregarPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ultimoPedido]);

  function corStatus(status: string) {
    switch (status) {
      case "PENDENTE":
        return "bg-red-100 text-red-700";

      case "EM PREPARO":
        return "bg-yellow-100 text-yellow-700";

      case "SAIU PARA ENTREGA":
        return "bg-blue-100 text-blue-700";

      case "ENTREGUE":
        return "bg-green-100 text-green-700";

      case "CANCELADO":
        return "bg-gray-300 text-gray-800";

      default:
        return "bg-gray-100";
    }
  }
  function imprimirPedido() {
    if (!pedidoAtual) return;

    const produtos = itens
      .map(
        (item) => `
        <tr>    
          <td>${item.quantidade}x ${item.produtos?.nome || "Produto"}</td>
          <td style="text-align:right">
            R$ ${(item.preco * item.quantidade).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const janela = window.open("", "_blank", "width=500,height=800");

    if (!janela) return;

    janela.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pedido #${pedidoAtual.id}</title>

<style>
body{
  font-family:Arial,sans-serif;
  padding:20px;
  font-size:14px;
}

h1{
  text-align:center;
  margin-bottom:5px;
}

hr{
  margin:12px 0;
}

table{
  width:100%;
  border-collapse:collapse;
}

td{
  padding:4px 0;
}

.total{
  font-size:22px;
  font-weight:bold;
  color:green;
  text-align:right;
  margin-top:15px;
}

@media print{
  button{
    display:none;
  }
}
</style>
</head>

<body>

<h1>EA CASA DE RAÇÃO</h1>

<hr>

<p><b>Pedido:</b> #${pedidoAtual.id}</p>

<p><b>Data:</b> ${new Date(
      pedidoAtual.created_at
    ).toLocaleString("pt-BR")}</p>

<p><b>Cliente:</b> ${pedidoAtual.cliente ?? "-"}</p>

<p><b>Telefone:</b> ${pedidoAtual.telefone ?? "-"}</p>

<p><b>Tipo:</b> ${pedidoAtual.tipo_entrega ?? "-"}</p>

${
  pedidoAtual.tipo_entrega === "ENTREGA"
    ? `
<p><b>Endereço:</b> ${pedidoAtual.endereco}, ${pedidoAtual.numero}</p>
<p><b>Bairro:</b> ${pedidoAtual.bairro}</p>
${
  pedidoAtual.complemento
    ? `<p><b>Complemento:</b> ${pedidoAtual.complemento}</p>`
    : ""
}
`
    : ""
}

<hr>

<h3>Produtos</h3>

<table>
${produtos}
</table>

<hr>

<p><b>Pagamento:</b> ${pedidoAtual.pagamento ?? "-"}</p>

${
  pedidoAtual.troco
    ? `<p><b>Troco:</b> R$ ${pedidoAtual.troco}</p>`
    : ""
}

${
  pedidoAtual.observacao
    ? `<p><b>Observação:</b> ${pedidoAtual.observacao}</p>`
    : ""
}

<div class="total">
TOTAL: R$ ${Number(pedidoAtual.total).toFixed(2)}
</div>

<hr>

<div style="text-align:center;margin-top:30px">
Obrigado pela preferência ❤️
</div>

<script>
window.onload = function () {
  window.print();
  setTimeout(() => window.close(), 500);
}
</script>

</body>
</html>
`);

    janela.document.close();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Pedidos
      </h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Pedido</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Telefone</th>
              <th className="text-left">Total</th>
              <th className="text-left">Status</th>
              <th className="text-left">Data</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((pedido) => (
              <tr
                key={pedido.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">
                  #{pedido.id}
                </td>

                <td>{pedido.cliente || "-"}</td>

                <td>{pedido.telefone || "-"}</td>

                <td>
                  R$ {Number(pedido.total).toFixed(2)}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${corStatus(
                      pedido.status
                    )}`}
                  >
                    {pedido.status}
                  </span>
                </td>

                <td>
                  {new Date(
                    pedido.created_at
                  ).toLocaleString("pt-BR")}
                </td>

                <td className="text-center">
                  <button
                    onClick={() => abrirPedido(pedido.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && pedidoAtual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Pedido #{pedidoAtual.id}
              </h2>

              <button
                onClick={() => setModalOpen(false)}
                className="text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="border rounded-lg p-4 mb-6 space-y-2">

              <p>
                <strong>Cliente:</strong> {pedidoAtual.cliente}
              </p>

              <p>
                <strong>Telefone:</strong> {pedidoAtual.telefone}
              </p>

              <p>
                <strong>Tipo:</strong> {pedidoAtual.tipo_entrega}
              </p>

              {pedidoAtual.tipo_entrega === "ENTREGA" && (
                <>
                  <p>
                    <strong>Endereço:</strong>{" "}
                    {pedidoAtual.endereco}, {pedidoAtual.numero}
                  </p>

                  <p>
                    <strong>Bairro:</strong> {pedidoAtual.bairro}
                  </p>

                  {pedidoAtual.complemento && (
                    <p>
                      <strong>Complemento:</strong>{" "}
                      {pedidoAtual.complemento}
                    </p>
                  )}
                </>
              )}

              <p>
                <strong>Pagamento:</strong> {pedidoAtual.pagamento}
              </p>

              {pedidoAtual.troco && (
                <p>
                  <strong>Troco:</strong> R$ {pedidoAtual.troco}
                </p>
              )}

              {pedidoAtual.observacao && (
                <p>
                  <strong>Observação:</strong> {pedidoAtual.observacao}
                </p>
              )}

              <p className="text-xl font-bold text-green-700 pt-3">
                Total: R$ {Number(pedidoAtual.total).toFixed(2)}
              </p>
            </div>

            <h3 className="text-xl font-bold mb-4">
              Produtos
            </h3>

            <div className="space-y-3 mb-6">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4"
                >
                  <h4 className="font-bold text-lg">
                    {item.produtos?.nome}
                  </h4>

                  <p>
                    Quantidade: {item.quantidade}
                  </p>

                  <p>
                    Valor Unitário: R$ {Number(item.preco).toFixed(2)}
                  </p>

                  <p className="font-bold text-green-700">
                    Subtotal: R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t pt-6">
              <h3 className="font-bold mb-3">
                Alterar Status
              </h3>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg w-full p-3"
              >
                <option value="PENDENTE">🔴 PENDENTE</option>
                <option value="EM PREPARO">🟡 EM PREPARO</option>
                <option value="SAIU PARA ENTREGA">
                  🔵 SAIU PARA ENTREGA
                </option>
                <option value="ENTREGUE">🟢 ENTREGUE</option>
                <option value="CANCELADO">⚫ CANCELADO</option>
              </select>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <button
                  onClick={salvarStatus}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
                >
                  💾 Salvar Status
                </button>

                <button
                  onClick={imprimirPedido}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold"
                >
                  🖨️ Imprimir
                </button>

                <button
                  onClick={excluirPedido}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold"
                >
                  🗑️ Excluir Pedido
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}