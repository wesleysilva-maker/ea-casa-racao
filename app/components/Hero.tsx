export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-24">

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
          Tudo para seu Pet
          <br />
          em um só lugar 🐶
        </h1>

        <p className="mt-5 text-base sm:text-lg md:text-xl max-w-xl">
          Rações, medicamentos, brinquedos, acessórios e muito mais para seu melhor amigo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">

          <a
            href="#produtos"
            className="w-full sm:w-auto text-center bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:scale-105 transition"
          >
            Ver Produtos
          </a>

          <a
            href="https://wa.me/5571993887651"
            target="_blank"
            className="w-full sm:w-auto text-center bg-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition"
          >
            WhatsApp
          </a>

        </div>

      </div>
    </section>
  );
}