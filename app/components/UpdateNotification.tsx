"use client";

import { useEffect, useState } from "react";

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    // Verifica a cada 30 segundos se há uma nova versão
    const interval = setInterval(() => {
      fetch("/package.json", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const currentVersion = localStorage.getItem("app-version");
          const newVersion = data.version;

          if (
            currentVersion &&
            currentVersion !== newVersion
          ) {
            setShowUpdate(true);
          } else {
            localStorage.setItem("app-version", newVersion);
          }
        })
        .catch((err) => console.log("Erro ao verificar versão:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  function recarregarSite() {
    setIsReloading(true);
    // Aguarda 1 segundo e recarrega
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-4 md:left-auto md:max-w-sm z-[10000] animate-bounce">
      <div className="bg-orange-500 text-white rounded-lg shadow-xl p-4">
        <div className="flex items-center gap-3">
          {isReloading ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-bold">Atualizando...</p>
                <p className="text-sm opacity-90">
                  Carregando a nova versão
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <p className="font-bold">Nova versão disponível!</p>
                <p className="text-sm opacity-90">
                  Clique para atualizar o site
                </p>
              </div>
              <button
                onClick={recarregarSite}
                className="bg-white text-orange-500 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm ml-2 whitespace-nowrap"
              >
                Atualizar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
