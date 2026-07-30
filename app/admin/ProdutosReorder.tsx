'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabaseClient';
import { GripVertical, Check } from 'lucide-react';
import Image from 'next/image';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  foto_url: string;
  categoria: string;
  order: number;
}

function SortableProdutoItem({ produto }: { produto: Produto }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: produto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all ${
        isDragging 
          ? 'shadow-2xl border-orange-500 scale-102' 
          : 'border-gray-200 hover:border-orange-300'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-orange-50 rounded transition-colors"
      >
        <GripVertical className="w-5 h-5 text-orange-600" />
      </button>

      <div className="w-14 h-14 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {produto.foto_url ? (
          <Image
            src={produto.foto_url}
            alt={produto.nome}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            📦
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate text-sm">
          {produto.nome}
        </p>
        <p className="text-xs text-gray-500">{produto.categoria}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-orange-600 text-sm">
          R$ {produto.preco.toFixed(2)}
        </p>
      </div>

      <div className="text-sm font-bold text-white bg-orange-600 px-3 py-1 rounded-full min-w-10 text-center">
        {produto.order}
      </div>
    </div>
  );
}

export default function ProdutosReorder() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage({ text: '❌ Erro ao carregar produtos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = produtos.findIndex((p) => p.id === active.id);
      const newIndex = produtos.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(produtos, oldIndex, newIndex);
      setProdutos(newOrder);

      await salvarOrdem(newOrder);
    }
  };

  const salvarOrdem = async (newOrder: Produto[]) => {
    try {
      setSaving(true);

      for (let i = 0; i < newOrder.length; i++) {
        const { error } = await supabase
          .from('produtos')
          .update({ order: i + 1 })
          .eq('id', newOrder[i].id);

        if (error) throw error;
      }

      showMessage('✅ Ordem atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      showMessage('❌ Erro ao salvar', 'error');
      fetchProdutos();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
        <p className="text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📋 Reordenar Produtos</h1>
        <p className="text-gray-600 mt-2">
          Arraste os produtos para reorganizar a ordem de exibição no site.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
          <p>{message.text}</p>
        </div>
      )}

      {saving && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center gap-2 text-blue-700">
          <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full"></div>
          <span className="text-sm">Salvando alterações...</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={produtos.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-200 p-4 space-y-3">
              {produtos.map((produto) => (
                <SortableProdutoItem key={produto.id} produto={produto} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Check className="w-5 h-5 text-green-600" />
        <span>
          <strong>{produtos.length} produtos</strong> na lista.
        </span>
      </div>
    </div>
  );
}