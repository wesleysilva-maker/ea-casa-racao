export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <h2 className="text-3xl font-black text-orange-500">
          EA CASA DE RAÇÃO
        </h2>

        <p className="mt-4">
          Tudo para seu melhor amigo.
        </p>

        <div className="mt-8 space-y-2">

          <p>📍 R. Queira Deus, 741 - Portão</p>

          <p>📞 (71) 99388-7651</p>

          <p>🚚 Entregamos em toda a região.</p>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Desenvolvido por Wesley Silva{" "}
            <a
              href="https://instagram.com/_weesleyyy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              @_weesleyyy
            </a>
          </p>
        </div>

      </div>

    </footer>
  );
}
