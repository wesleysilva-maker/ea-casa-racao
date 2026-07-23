"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductModal, { Produto } from "./ProductModal";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setProdutos(data || []);
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

 async function excluirProduto(produto: Produto) {
  if (!confirm(`Excluir "${produto.nome}"?`)) return;

  const { error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", produto.id);

  if (error) {
    alert(error.message);
    return;
  }

  carregarProdutos();
}

return (
  <div className="p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold">
          Gerenciar Produtos
        </h1>

        <button
          onClick={() => {
            setProdutoEditando(null);
            setModalOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold"
        >
          + Novo Produto
        </button>

      </div>

      <div className="overflow-x-auto rounded-xl border shadow">

        <table className="w-full">

          <thead className="bg-orange-100">

            <tr>

              <th className="p-4 text-left">Foto</th>
              <th className="text-left">Nome</th>
              <th className="text-left">Categoria</th>
              <th className="text-left">Preço</th>
              <th className="text-left">Estoque</th>
              <th className="text-left">Promoção</th>
              <th className="text-center">Ações</th>

            </tr>

          </thead>

          <tbody>

            {produtos.length === 0 ? (

              <tr>

                <td colSpan={7} className="text-center py-10">
                  Nenhum produto cadastrado.
                </td>

              </tr>

            ) : (

              produtos.map((produto) => (

                <tr
                  key={produto.id}
                  className="border-t hover:bg-orange-50 transition"
                >

                  <td className="p-3">

                    {produto.imagem ? (

                      <Image
                        src={produto.imagem}
                        alt={produto.nome}
                        width={70}
                        height={70}
                        className="rounded-lg object-cover border"
                      />

                    ) : (

                      <div className="w-[70px] h-[70px] rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        Sem foto
                      </div>

                    )}

                  </td>

                  <td className="font-semibold">
                    {produto.nome}
                  </td>

                  <td>{produto.categoria}</td>

                  <td className="font-bold text-green-600">
                    R$ {Number(produto.preco).toFixed(2)}
                  </td>

                  <td>{produto.estoque}</td>

                  <td>

                    {produto.promocao ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Em promoção
                      </span>

                    ) : (

                      <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                        Normal
                      </span>

                    )}

                  </td>

                  <td>

                    <div className="flex gap-2 justify-center">

                      <button
                        onClick={() => {
                          setProdutoEditando(produto);
                          setModalOpen(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => excluirProduto(produto)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                      >
                        Excluir
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

           <ProductModal
        open={modalOpen}
        produto={produtoEditando}
        onClose={() => {
          setModalOpen(false);
          setProdutoEditando(null);
        }}
        onSaved={() => {
          carregarProdutos();
          setModalOpen(false);
          setProdutoEditando(null);
        }}
      />
    </div>
  );
}