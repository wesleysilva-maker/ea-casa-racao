"use client";

import Image from "next/image";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  estoque: number;
  estoque_kg: number;
  fracionado: boolean;
  promocao: boolean;
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
const disponivel = product.fracionado
  ? product.estoque_kg > 0
  : product.estoque > 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col">

      <div className="relative w-full h-56">

        <Image
          src={product.imagem}
          alt={product.nome}
          fill
          className="object-contain p-4"
        />

        {product.promocao && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            🔥 OFERTA
          </div>
        )}

        {!disponivel && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-6 py-2 rounded-xl text-lg font-bold">
              ESGOTADO
            </span>
          </div>
        )}

      </div>

      <div className="p-5 flex-1 flex flex-col">

        <h3 className="text-xl font-bold">
          {product.nome}
        </h3>

        <p className="text-gray-500">
          {product.categoria}
        </p>

        <p className="text-3xl font-black text-orange-600 mt-4">
          R$ {product.preco.toFixed(2)}
        </p>

        <p className="text-sm text-gray-500 mt-2">
{product.fracionado
  ? `Disponível: ${product.estoque_kg} kg`
  : `Estoque: ${product.estoque}`}
</p>
        {disponivel ? (
        
          <button
            onClick={() => addToCart(product)}
            className="mt-auto w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold mt-6"
          >
            Adicionar ao Carrinho
          </button>
        ) : (
          <button
            disabled
            className="mt-auto w-full bg-gray-400 text-white py-3 rounded-xl font-bold mt-6 cursor-not-allowed"
          >
            Produto Esgotado
          </button>
        )}

      </div>

    </div>
  );
}