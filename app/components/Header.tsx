export default function Header() {
  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">

        <div className="flex items-center gap-3">

          <img
            src="/logo.png"
            alt="EA Casa de Ração"
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
          />

          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-orange-500 leading-tight">
              EA CASA
              <br className="sm:hidden" />
              DE RAÇÃO
            </h1>

            <p className="text-xs sm:text-sm text-gray-300">
              Tudo para seu pet
            </p>
          </div>

        </div>

        <nav className="hidden lg:flex gap-8 font-semibold">
          <a href="#topo" className="hover:text-orange-500 transition">
            Início
          </a>

          <a href="#produtos" className="hover:text-orange-500 transition">
            Produtos
          </a>

          <a href="#produtos" className="hover:text-orange-500 transition">
            Promoções
          </a>

          <a href="#footer" className="hover:text-orange-500 transition">
            Contato
          </a>
        </nav>

        <a
          href="https://wa.me/5571993887651"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition"
        >
          WhatsApp
        </a>

      </div>
    </header>
  );
}