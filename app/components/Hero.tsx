"use client";

import { ShoppingBag, MessageCircle } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/hero-banner.png')",
      }}
    >
      {/* Escurece levemente para destacar os botões */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Botões */}
      <div className="relative z-10 max-w-7xl mx-auto h-screen flex items-end lg:items-center px-6 pb-16 lg:pb-0">

        <div className="flex flex-wrap gap-4 lg:ml-10">

          <a
            href="#produtos"
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-orange-600 font-bold px-7 py-4 rounded-xl shadow-xl"
          >
            <ShoppingBag size={20} />
            Ver Produtos
          </a>

          <a
            href="https://wa.me/5571993887651"
            target="_blank"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-7 py-4 rounded-xl font-bold shadow-xl"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>

        </div>
      </div>
    </section>
  );
}