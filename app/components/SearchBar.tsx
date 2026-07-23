type Props = {
  value: string;
  onChange: (texto: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="text"
        placeholder="Pesquisar produtos..."
        className="w-full border rounded-xl p-4 text-lg shadow"
      />
    </section>
  );
}