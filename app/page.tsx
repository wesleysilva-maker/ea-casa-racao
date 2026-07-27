"use client";

import { useEffect, useMemo, useState } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import Categories from "./components/Categories";
import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Cart from "@/app/components/Cart";

import { supabase } from "@/lib/supabase";

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    console.log(JSON.stringify(data, null, 2));
    setProducts(data || []);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        category === "Todos" || product.categoria === category;

      const matchSearch = product.nome
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [products, search, category]);

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <Hero />

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <Categories
        selected={category}
        onSelect={setCategory}
      />

      <ProductGrid
        products={filteredProducts}
      />

      <Footer />
      <Cart />
      <WhatsAppButton />
    </main>
  );
}