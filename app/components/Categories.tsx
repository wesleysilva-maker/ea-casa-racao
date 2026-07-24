type Props = {
  selected: string;
  onSelect: (categoria: string) => void;
};

const categorias = [
  "AAAAAAAA",
  "BBBBBBBB",
  "CCCCCCCC",
];

export default function Categories({ selected, onSelect }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-12">
      <div className="flex flex-wrap gap-4 justify-center">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => onSelect(categoria)}
            className={`px-6 py-3 rounded-full font-semibold transition ${
              selected === categoria
                ? "bg-orange-500 text-black"
                : "bg-orange-100 hover:bg-orange-500 hover:text-black"
            }`}
          >
            {categoria}
          </button>
        ))}
      </div>
    </section>
  );
}