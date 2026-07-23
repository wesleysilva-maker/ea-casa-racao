"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Permite abrir a página de login normalmente
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    async function verificarLogin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setLoading(false);
    }

    verificarLogin();
  }, [pathname, router]);

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const menu = [
    {
      nome: "📊 Dashboard",
      href: "/admin/dashboard",
    },
    {
      nome: "📦 Produtos",
      href: "/admin/produtos",
    },
    {
      nome: "🛒 Pedidos",
      href: "/admin/pedidos",
    },
    {
      nome: "⚙ Configurações",
      href: "/admin/configuracoes",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    );
  }

  // Na tela de login não mostra o menu lateral
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-orange-600 text-white flex flex-col">
        <div className="p-6 border-b border-orange-500">
          <h1 className="text-2xl font-bold">
            EA Casa de Ração
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition ${
                pathname === item.href
                  ? "bg-orange-800 font-bold"
                  : "hover:bg-orange-700"
              }`}
            >
              {item.nome}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-orange-500">
          <button
            onClick={sair}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}