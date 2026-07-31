"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "../context/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CheckoutModal({
  open,
  onClose,
}: Props) {
  const { cart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("ENTREGA");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [pagamento, setPagamento] = useState("PIX");
  const [troco, setTroco] = useState("");
  const [observacao, setObservacao] = useState("");

  const total = cart.reduce((acc, item) => {
    if (item.fracionado) {
      const gramas = item.quantidadeGramas || 0;
      return acc + item.preco * (gramas / 1000);
    }
    return acc + item.preco * (item.quantidade || 0);
  }, 0);

  if (!open) return null;

  async function enviarPedido() {
    if (!cliente.trim()) {
      alert("Informe seu nome.");
      return;
    }

    if (!telefone.trim()) {
      alert("Informe seu telefone.");
      return;
    }

    if (tipoEntrega === "ENTREGA") {
      if (!endereco.trim()) {
        alert("Informe o endereço.");
        return;
      }

      if (!numero.trim()) {
        alert("Informe o número.");
        return;
      }

      if (!bairro.trim()) {
        alert("Informe o bairro.");
        return;
      }
    }

    setLoading(true);

    try {
      // INSERE PEDIDO
      const { data: pedidoData, error: erroPedido } = await supabase
        .from("pedidos")
        .insert({
          cliente,
          telefone,
          tipo_entrega: tipoEntrega,
          endereco: tipoEntrega === "ENTREGA" ? endereco : null,
          numero: tipoEntrega === "ENTREGA" ? numero : null,
          bairro: tipoEntrega === "ENTREGA" ? bairro : null,
          complemento: tipoEntrega === "ENTREGA" ? complemento : null,
          pagamento,
          troco,
          observacao,
          total,
          status: "PENDENTE",
        })
        .select();

      if (erroPedido || !pedidoData || pedidoData.length === 0) {
        throw new Error(
          erroPedido?.message || "Erro ao criar pedido"
        );
      }

      const pedido = pedidoData[0];

      // INSERE ITENS DO PEDIDO
      const itens = cart.map((item) => {
        if (item.fracionado) {
          const gramas = item.quantidadeGramas || 0;
          const precoTotal = item.preco * (gramas / 1000);
          return {
            pedido_id: pedido.id,
            produto_id: item.id,
            quantidade: 0,
            quantidade_gramas: gramas,
            preco: precoTotal,
          };
        } else {
          const precoTotal = item.preco * (item.quantidade || 1);
          return {
            pedido_id: pedido.id,
            produto_id: item.id,
            quantidade: item.quantidade || 0,
            quantidade_gramas: 0,
            preco: precoTotal,
          };
        }
      });

      const { error: erroItens } = await supabase
        .from("pedido_itens")
        .insert(itens);

      if (erroItens) {
        throw new Error(erroItens.message || "Erro ao adicionar itens");
      }

      // MONTA MENSAGEM DO WHATSAPP
      const listaProdutos = cart
        .map((item) => {
          let qtyLabel = "";
          let subtotal = 0;

          if (item.fracionado) {
            const gramas = item.quantidadeGramas || 0;
            qtyLabel = `${gramas}g`;
            subtotal = item.preco * (gramas / 1000);
          } else {
            qtyLabel = `${item.quantidade || 0}x`;
            subtotal = item.preco * (item.quantidade || 0);
          }

          return `• ${qtyLabel} ${item.nome}\nR$ ${subtotal.toFixed(2)}`;
        })
        .join("\n\n");

      const mensagem = `🐶 *EA CASA DE RAÇÃO*

📦 Pedido Nº ${pedido.id}

👤 Cliente:
${cliente}

📱 Telefone:
${telefone}

🚚 Tipo:
${tipoEntrega}

${
  tipoEntrega === "ENTREGA"
    ? `📍 Endereço:
${endereco}, ${numero}
Bairro: ${bairro}
${complemento ? `Complemento: ${complemento}` : ""}`
    : "🏪 Retirada na Loja"
}

💳 Pagamento:
${pagamento}

${pagamento === "Dinheiro" && troco ? `💵 Troco para: R$ ${troco}` : ""}

🛒 Produtos:

${listaProdutos}

----------------------------

💰 TOTAL: R$ ${total.toFixed(2)}

${observacao ? `📝 Observação:\n${observacao}` : ""}`;

      const telefoneLoja = "5571993887651";

      window.open(
        `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(mensagem)}`,
        "_blank"
      );

      // LIMPA FORMULÁRIO
      clearCart();
      setCliente("");
      setTelefone("");
      setEndereco("");
      setNumero("");
      setBairro("");
      setComplemento("");
      setTroco("");
      setObservacao("");
      setPagamento("PIX");
      setTipoEntrega("ENTREGA");

      alert("✅ Pedido enviado com sucesso! Número: " + pedido.id);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar pedido";

      console.error("Erro:", err);
      alert("❌ " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Finalizar Pedido</h2>

        <input
          className="border rounded-lg w-full p-3 mb-3"
          placeholder="Nome Completo *"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />

        <input
          className="border rounded-lg w-full p-3 mb-5"
          placeholder="Telefone *"
          value={telefone}
          onChange={(e) => {
            const valor = e.target.value
              .replace(/\D/g, "")
              .replace(/(\d{2})(\d)/, "($1) $2")
              .replace(/(\d{5})(\d)/, "$1-$2")
              .slice(0, 15);

            setTelefone(valor);
          }}
        />

        <label className="font-bold">Tipo do Pedido</label>

        <select
          className="border rounded-lg w-full p-3 mt-2 mb-5"
          value={tipoEntrega}
          onChange={(e) => setTipoEntrega(e.target.value)}
        >
          <option value="ENTREGA">Entrega</option>
          <option value="RETIRADA">Retirar na Loja</option>
        </select>

        {tipoEntrega === "ENTREGA" && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
              <p className="text-blue-700">
                {total >= 30
                  ? "✅ Frete em Portão: R$ 5.00 (grátis acima de R$ 30) ou retire na loja! Demais localidades sera enviado no whatssap"
                  : `⚠️  Frete em Portão: R$ 5.00 (grátis acima de R$ 30) ou retire na loja! Demais localidades sera enviado no whatssap`}
              </p>
            </div>  

            <input
              className="border rounded-lg w-full p-3 mb-3"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <input
              className="border rounded-lg w-full p-3 mb-3"
              placeholder="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />

            <input
              className="border rounded-lg w-full p-3 mb-3"
              placeholder="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />

            <input
              className="border rounded-lg w-full p-3 mb-5"
              placeholder="Complemento (Opcional)"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
          </>
        )}

        <label className="font-bold">Forma de Pagamento</label>

        <select
          className="border rounded-lg w-full p-3 mt-2 mb-4"
          value={pagamento}
          onChange={(e) => setPagamento(e.target.value)}
        >
          <option value="PIX">PIX</option>
          <option value="Cartão">Cartão</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>

        {pagamento === "Dinheiro" && (
          <input
            className="border rounded-lg w-full p-3 mb-4"
            placeholder="Troco para quanto?"
            value={troco}
            onChange={(e) => setTroco(e.target.value)}
          />
        )}

        <textarea
          className="border rounded-lg w-full p-3 mb-5"
          rows={4}
          placeholder="Observações"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <div className="border rounded-xl p-4 bg-gray-50 mb-5">
          <h3 className="font-bold text-lg mb-3">Resumo do Pedido</h3>

          {cart.map((item) => {
            let qtyLabel = "";
            let subtotal = 0;

            if (item.fracionado) {
              const gramas = item.quantidadeGramas || 0;
              qtyLabel = `${gramas}g`;
              subtotal = item.preco * (gramas / 1000);
            } else {
              qtyLabel = `${item.quantidade || 0}x`;
              subtotal = item.preco * (item.quantidade || 0);
            }

            return (
              <div key={item.id} className="flex justify-between mb-2">
                <span>
                  {qtyLabel} {item.nome}
                </span>

                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
            );
          })}

          <hr className="my-3" />

          <div className="flex justify-between text-xl font-bold text-green-700">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-xl font-bold"
          >
            Cancelar
          </button>

          <button
            onClick={enviarPedido}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
