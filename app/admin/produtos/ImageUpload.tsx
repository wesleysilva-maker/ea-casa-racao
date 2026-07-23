"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  async function upload(file: File) {
    try {
      setLoading(true);

      const extensao = file.name.split(".").pop();
      const nomeArquivo = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extensao}`;

      const { error } = await supabase.storage
        .from("produtos")
        .upload(nomeArquivo, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("produtos")
        .getPublicUrl(nomeArquivo);

      onChange(data.publicUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">

      <label className="font-medium">
        Imagem
      </label>

      {value && (
        <img
          src={value}
          alt="Preview"
          className="w-40 h-40 object-cover rounded-lg border"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {loading && (
        <p>Enviando imagem...</p>
      )}

    </div>
  );
}