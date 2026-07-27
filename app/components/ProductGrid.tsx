import ProductCard from "./ProductCard";

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
  products: Product[];
}

export default function ProductGrid({ products }: Props) {
  return (
    <section
      id="produtos"
      className="max-w-7xl mx-auto px-6 py-16"
    >
      <h2 className="text-4xl font-black text-center mb-12">
        Produtos em Destaque
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </section>
  );
}