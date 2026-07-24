"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageUpload from "./ImageUpload";

export interface Produto {
  id?: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  estoque: number;
  descricao: string;
  promocao: boolean;
  fracionado: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  produto?: Produto | null;
}

export default function ProductModal({
  open,
  onClose,
  onSaved,
  produto,
}: Props) {

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState("");
  const [estoque, setEstoque] = useState("");
  const [descricao, setDescricao] = useState("");
  const [promocao, setPromocao] = useState(false);
const [fracionado, setFracionado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (produto) {

      setNome(produto.nome);
      setCategoria(produto.categoria);
      setPreco(String(produto.preco));
      setImagem(produto.imagem);
      setEstoque(String(produto.estoque));
      setDescricao(produto.descricao);
      setPromocao(produto.promocao);
setFracionado(produto.fracionado ?? false);
    } else {

      limparFormulario();

    }

  }, [produto, open]);

  function limparFormulario() {

    setNome("");
    setCategoria("");
    setPreco("");
    setImagem("");
    setEstoque("");
    setDescricao("");
    setPromocao(false);
setFracionado(false);
  }

  if (!open) return null;

async function salvarProduto() {

  if (!nome || !categoria || !preco) {
    alert("Preencha os campos obrigatórios.");
    return;
  }

  try {

    setLoading(true);

    const dados = {
  nome,
  categoria,
  preco: Number(preco),
  imagem,
  estoque: Number(estoque || 0),
  descricao,
  promocao,
  fracionado,
};

    if (produto?.id) {

      const { error } = await supabase
        .from("produtos")
        .update(dados)
        .eq("id", produto.id);

      if (error) throw error;

      alert("Produto atualizado com sucesso!");

    } else {

      const { error } = await supabase
        .from("produtos")
        .insert(dados);

      if (error) throw error;

      alert("Produto cadastrado com sucesso!");

    }

    limparFormulario();

    onSaved();

    onClose();

  } catch (err: any) {

    alert(err.message);

  } finally {

    setLoading(false);

  }

}

return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">

      <h2 className="text-3xl font-bold mb-6">
        {produto ? "Editar Produto" : "Novo Produto"}
      </h2>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <ImageUpload
          value={imagem}
          onChange={setImagem}
        />

        <input
          type="number"
          placeholder="Estoque"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Descrição"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={promocao}
            onChange={(e) => setPromocao(e.target.checked)}
          />

          Produto em promoção

        </label>

<label className="flex items-center gap-3">

  <input
    type="checkbox"
    checked={fracionado}
    onChange={(e) => setFracionado(e.target.checked)}
  />

  Produto vendido fracionado (kg)

</label>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          onClick={() => {
            limparFormulario();
            onClose();
          }}
          className="px-5 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
        >
          Cancelar
        </button>

        <button
          onClick={salvarProduto}
          disabled={loading}
          className="px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : produto
            ? "Atualizar Produto"
            : "Salvar Produto"}
        </button>

      </div>

    </div>

  </div>
);
}