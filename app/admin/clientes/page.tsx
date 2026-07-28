"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  created_at: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome");

    if (error) {
      console.error(error);
      return;
    }

    setClientes(data || []);
  }

  function abrirModalEditar(cliente: Cliente) {
    setClienteSelecionado(cliente);
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setEndereco(cliente.endereco);
    setNumero(cliente.numero);
    setBairro(cliente.bairro);
    setComplemento(cliente.complemento);
    setModalAberto(true);
  }

  function abrirModalNovo() {
    setClienteSelecionado(null);
    setNome("");
    setTelefone("");
    setEndereco("");
    setNumero("");
    setBairro("");
    setComplemento("");
    setModalAberto(true);
  }

  async function salvarCliente() {
    if (!nome.trim() || !telefone.trim()) {
      alert("Nome e telefone são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      if (clienteSelecionado) {
        // EDITAR
        const { error } = await supabase
          .from("clientes")
          .update({
            nome,
            telefone,
            endereco,
            numero,
            bairro,
            complemento,
          })
          .eq("id", clienteSelecionado.id);

        if (error) throw error;
        alert("✅ Cliente atualizado!");
      } else {
        // NOVO
        const { error } = await supabase.from("clientes").insert({
          nome,
          telefone,
          endereco,
          numero,
          bairro,
          complemento,
        });

        if (error) throw error;
        alert("✅ Cliente criado!");
      }

      carregarClientes();
      setModalAberto(false);
    } catch (err: any) {
      alert("❌ Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente(cliente: Cliente) {
    if (!confirm(`Tem certeza que quer excluir "${cliente.nome}"?`)) return;

    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id);

      if (error) throw error;

      alert("✅ Cliente excluído!");
      carregarClientes();
    } catch (err: any) {
      alert("❌ Erro: " + err.message);
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">👥 Clientes</h1>
        <button
          onClick={abrirModalNovo}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold"
        >
          + Novo Cliente
        </button>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto rounded-xl border shadow">
        <table className="w-full">
          <thead className="bg-orange-100">
            <tr>
              <th className="p-4 text-left">Nome</th>
              <th className="text-left">Telefone</th>
              <th className="text-left">Endereço</th>
              <th className="text-left">Bairro</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t hover:bg-orange-50">
                  <td className="p-3 font-bold">{cliente.nome}</td>
                  <td>{cliente.telefone}</td>
                  <td>
                    {cliente.endereco}, {cliente.numero}
                  </td>
                  <td>{cliente.bairro}</td>
                  <td className="text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => excluirCliente(cliente)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              {clienteSelecionado ? "✏️ Editar Cliente" : "➕ Novo Cliente"}
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="Nome *"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border rounded-lg p-3 col-span-2"
              />

              <input
                type="text"
                placeholder="Telefone *"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="border rounded-lg p-3"
              />

              <input
                type="text"
                placeholder="Endereço"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="border rounded-lg p-3"
              />

              <input
                type="text"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="border rounded-lg p-3"
              />

              <input
                type="text"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="border rounded-lg p-3"
              />

              <input
                type="text"
                placeholder="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="border rounded-lg p-3 col-span-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={salvarCliente}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
