"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VendaBalcaoPage() {
  const [pesquisaCliente, setPesquisaCliente] = useState("");
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);

  const [pesquisaProduto, setPesquisaProduto] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carrinho, setCarrinho] = useState<any[]>([]);

  useEffect(() => {
    buscarClientes();
    buscarProdutos();
  }, []);

  async function buscarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    setClientes(data || []);
  }

  async function buscarProdutos() {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("nome");

  if (error) {
    console.log(error);
    return;
  }

  const produtosFormatados = (data || []).map((p) => ({
    ...p,
    estoque: Number(p.estoque),
    estoque_kg: Number(p.estoque_kg || 0),
    peso_saco: Number(p.peso_saco || 0),
    fracionado: p.fracionado,
  }));

  setProdutos(produtosFormatados);
}

function adicionarCarrinho(produto: any) {

  // Produto fracionado
  if (produto.fracionado) {

    const entrada = prompt("Quantas gramas deseja vender? (Digite apenas números. Ex: 500)");
console.log("Entrada:", entrada);

const gramas = Number(entrada?.replace(",", "."));

console.log("Gramas:", gramas);

if (isNaN(gramas) || gramas <= 0) {
  alert("Quantidade inválida.");
  return;
}

    const kg = gramas / 1000;

console.log("Gramas:", gramas);
console.log("KG:", kg);
console.log("Estoque KG:", produto.estoque_kg);
console.log(produto);

if (kg > produto.estoque_kg) {
  alert("Estoque insuficiente.");
  return;
    }

    setCarrinho([
      ...carrinho,
      {
        ...produto,
        quantidade: kg,          // usado para calcular o valor
        gramas: gramas,          // usado para exibir
        fracionado: true,
      },
    ]);

    return;
  }

  // Produto normal
  const existe = carrinho.find((p) => p.id === produto.id);

  if (existe) {
    setCarrinho(
      carrinho.map((p) =>
        p.id === produto.id
          ? { ...p, quantidade: p.quantidade + 1 }
          : p
      )
    );
  } else {
    setCarrinho([
      ...carrinho,
      {
        ...produto,
        quantidade: 1,
      },
    ]);
  }
}

  function aumentar(id: number) {
    setCarrinho(
      carrinho.map((p) =>
        p.id === id
          ? { ...p, quantidade: p.quantidade + 1 }
          : p
      )
    );
  }

  function diminuir(id: number) {
    setCarrinho(
      carrinho
        .map((p) =>
          p.id === id
            ? { ...p, quantidade: p.quantidade - 1 }
            : p
        )
        .filter((p) => p.quantidade > 0)
    );
  }

  function remover(id: number) {
    setCarrinho(
      carrinho.filter((p) => p.id !== id)
    );
  }

  const total = carrinho.reduce(
  (acc, item) =>
    acc + item.preco * item.quantidade,
  0
);

async function finalizarVenda() {
  if (!clienteSelecionado) {
    alert("Selecione um cliente.");
    return;
  }

  if (carrinho.length === 0) {
    alert("Adicione pelo menos um produto.");
    return;
  }

  // Salva o pedido
  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      cliente: clienteSelecionado.nome,
      telefone: clienteSelecionado.telefone,
      endereco: clienteSelecionado.endereco,
      numero: clienteSelecionado.numero,
      bairro: clienteSelecionado.bairro,
      complemento: clienteSelecionado.complemento || "",
      pagamento: "BALCÃO",
      tipo_entrega: "RETIRADA",
      status: "CONCLUÍDO",
      total: total,
      troco: "",
      observacao: "Venda Balcão",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Erro ao salvar o pedido.");
    return;
  }
const itens = carrinho.map((produto) => ({
  pedido_id: pedido.id,
  produto_id: produto.id,
  quantidade: produto.quantidade,
  preco: produto.preco,
}));

 // Salva os itens do pedido
const { error: erroItens } = await supabase
  .from("pedido_itens")
  .insert(itens);

if (erroItens) {
  console.error(erroItens);
  alert("Erro ao salvar os itens.");
  return;
}

// BAIXA O ESTOQUE
for (const produto of carrinho) {

  // Produto fracionado
  if (produto.fracionado) {

    await supabase
      .from("produtos")
      .update({
        estoque_kg: Number(produto.estoque_kg) - Number(produto.quantidade),
      })
      .eq("id", produto.id);

  } else {

    // Produto normal
    await supabase
      .from("produtos")
      .update({
        estoque: Number(produto.estoque) - Number(produto.quantidade),
      })
      .eq("id", produto.id);

  }

}

// Limpa a tela
setCarrinho([]);
setClienteSelecionado(null);
setPesquisaCliente("");
setPesquisaProduto("");

alert("Venda realizada com sucesso!");
}

return (
    <div className="p-8">

      <h1 className="text-4xl font-bold text-orange-600 mb-8">
        💰 Venda Balcão
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* CLIENTE */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Cliente
          </h2>

          <input
            type="text"
            placeholder="Pesquisar cliente..."
            value={pesquisaCliente}
            onChange={(e) => setPesquisaCliente(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <div className="mt-4 max-h-72 overflow-auto">

            {clientes
              .filter((cliente) =>
                cliente.nome
                  ?.toLowerCase()
                  .includes(pesquisaCliente.toLowerCase())
              )
              .map((cliente) => (

                <div
                  key={cliente.id}
                  onClick={() => {
                    setClienteSelecionado(cliente);
                    setPesquisaCliente(cliente.nome);
                  }}
                  className="border rounded-lg p-3 mb-2 cursor-pointer hover:bg-orange-100"
                >

                  <strong>{cliente.nome}</strong>

                  <br />

                  <span className="text-gray-500">
                    {cliente.telefone}
                  </span>

                </div>

              ))}

          </div>

          {clienteSelecionado && (

            <div className="mt-5 bg-green-100 border border-green-400 rounded-lg p-4">

              <h3 className="font-bold mb-2">
                Cliente Selecionado
              </h3>

              <p><b>Nome:</b> {clienteSelecionado.nome}</p>

              <p><b>Telefone:</b> {clienteSelecionado.telefone}</p>

              <p>
                <b>Endereço:</b>{" "}
                {clienteSelecionado.endereco},{" "}
                {clienteSelecionado.numero}
              </p>

              <p>
                <b>Bairro:</b> {clienteSelecionado.bairro}
              </p>

            </div>

          )}

        </div>

        {/* PRODUTOS */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold mb-4">
            Produtos
          </h2>

          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={pesquisaProduto}
            onChange={(e) => setPesquisaProduto(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <div className="mt-4 max-h-72 overflow-auto">

            {produtos
              .filter((produto) =>
                produto.nome
                  ?.toLowerCase()
                  .includes(pesquisaProduto.toLowerCase())
              )
              .map((produto) => (

                <div
                  key={produto.id}
                  onClick={() => adicionarCarrinho(produto)}
                  className="border rounded-lg p-3 mb-2 cursor-pointer hover:bg-orange-100"
                >

                  <strong>{produto.nome}</strong>

                  <br />

                  <span className="text-orange-600 font-bold">
                    R$ {Number(produto.preco).toFixed(2)}
                  </span>

                </div>

              ))}

          </div>

        </div>

      </div>
      <div className="bg-white rounded-xl shadow p-6 mt-8">

        <h2 className="text-2xl font-bold mb-4">
          Carrinho
        </h2>

        {carrinho.length === 0 ? (

          <p className="text-gray-500">
            Nenhum produto adicionado.
          </p>

        ) : (

          <div className="space-y-3">

            {carrinho.map((produto) => (

              <div
                key={produto.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >

                <div>

                  <strong>
                    {produto.nome}
                  </strong>

                  <br />

                  <span className="text-gray-500">
                    R$ {Number(produto.preco).toFixed(2)}
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => diminuir(produto.id)}
                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full"
                  >
                    -
                  </button>

                <strong>
  {produto.fracionado
    ? `${produto.gramas} g`
    : produto.quantidade}
</strong>

                  <button
                    onClick={() => aumentar(produto.id)}
                    className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full"
                  >
                    +
                  </button>

                  <button
                    onClick={() => remover(produto.id)}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-lg"
                  >
                    Remover
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

        <div className="border-t mt-6 pt-6 flex justify-between items-center">

          <span className="text-2xl font-bold">
            Total
          </span>

          <span className="text-3xl font-bold text-orange-600">
            R$ {total.toFixed(2)}
          </span>

        </div>

        <button
  onClick={finalizarVenda}
  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-xl font-bold"
>
  Finalizar Venda
</button>

      </div>

    </div>
  );
}