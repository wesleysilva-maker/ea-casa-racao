"use client";

import ProductCard from "./ProductCard";

type Product = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  estoque: number;
  estoque_kg: number;
  peso_saco: number;
  fracionado: boolean;
  promocao: boolean;
};

interface Props {
  products: Product[];
}

export default function ProductGrid({ products }: Props) {
  return (
    <section className="px-4 py-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </section>
  );
}