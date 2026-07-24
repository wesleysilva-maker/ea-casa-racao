"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  created_at: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);

  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    numero: "",
    bairro: "",
    complemento: "",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setClientes(data || []);
  }

  async function salvarCliente() {
    const { error } = await supabase
      .from("clientes")
      .insert([
        {
          nome: novoCliente.nome,
          telefone: novoCliente.telefone,
          endereco: novoCliente.endereco,
          numero: novoCliente.numero,
          bairro: novoCliente.bairro,
          complemento: novoCliente.complemento,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Cliente cadastrado com sucesso!");

    setMostrarModal(false);

    setNovoCliente({
      nome: "",
      telefone: "",
      endereco: "",
      numero: "",
      bairro: "",
      complemento: "",
    });

    carregarClientes();
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    return (
      cliente.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (cliente.telefone || "").includes(pesquisa)
    );
  });

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-orange-600">
          👥 Clientes
        </h1>

        <button
          onClick={() => setMostrarModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold"
        >
          + Novo Cliente
        </button>

      </div>

      <input
        type="text"
        placeholder="Pesquisar cliente..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        className="w-full border rounded-xl p-4 mb-8"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-orange-600 text-white">

            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-left p-4">Endereço</th>
            </tr>

          </thead>

          <tbody>

            {clientesFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center p-8 text-gray-500"
                >
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    {cliente.nome}
                  </td>

                  <td className="p-4">
                    {cliente.telefone}
                  </td>

                  <td className="p-4">
                    {cliente.endereco}, {cliente.numero}
                    <br />
                    <span className="text-gray-500 text-sm">
                      {cliente.bairro}
                    </span>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-8 w-full max-w-xl">

            <h2 className="text-2xl font-bold mb-6">
              Novo Cliente
            </h2>

            <div className="space-y-4">

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Nome"
                value={novoCliente.nome}
                onChange={(e) =>
                  setNovoCliente({
                    ...novoCliente,
                    nome: e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Telefone"
                value={novoCliente.telefone}
                onChange={(e) =>
                  setNovoCliente({
                    ...novoCliente,
                    telefone: e.target.value,
                  })
                }
              />

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Endereço"
                value={novoCliente.endereco}
                onChange={(e) =>
                  setNovoCliente({
                    ...novoCliente,
                    endereco: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">

                <input
                  className="border rounded-lg p-3"
                  placeholder="Número"
                  value={novoCliente.numero}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      numero: e.target.value,
                    })
                  }
                />

                <input
                  className="border rounded-lg p-3"
                  placeholder="Bairro"
                  value={novoCliente.bairro}
                  onChange={(e) =>
                    setNovoCliente({
                      ...novoCliente,
                      bairro: e.target.value,
                    })
                  }
                />

              </div>

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Complemento"
                value={novoCliente.complemento}
                onChange={(e) =>
                  setNovoCliente({
                    ...novoCliente,
                    complemento: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setMostrarModal(false)}
                className="px-5 py-3 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>

              <button
                onClick={salvarCliente}
                className="px-5 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                Salvar Cliente
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}