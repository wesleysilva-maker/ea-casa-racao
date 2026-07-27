"use client";

import { createContext, useContext, useState } from "react";

type Product = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  fracionado?: boolean;
  estoque_kg?: number;
};

export type CartItem = Product & {
  quantidade?: number;
  quantidadeKg?: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantidadeKg?: number) => void;
  removeFromCart: (id: number) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext({} as CartContextType);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Product, quantidadeKg?: number) {
    setCart((old) => {
      const existe = old.find((item) => item.id === product.id);

      if (existe) {
        if (product.fracionado && quantidadeKg) {
          return old.map((item) =>
            item.id === product.id
              ? { ...item, quantidadeKg: (item.quantidadeKg || 0) + quantidadeKg }
              : item
          );
        } else {
          return old.map((item) =>
            item.id === product.id
              ? { ...item, quantidade: (item.quantidade || 0) + 1 }
              : item
          );
        }
      }

      if (product.fracionado && quantidadeKg) {
        return [...old, { ...product, quantidadeKg }];
      }

      return [...old, { ...product, quantidade: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((old) => old.filter((item) => item.id !== id));
  }

  function increaseQuantity(id: number) {
    setCart((old) =>
      old.map((item) => {
        if (item.id === id) {
          if (item.fracionado) {
            return { ...item, quantidadeKg: (item.quantidadeKg || 0) + 0.5 };
          } else {
            return { ...item, quantidade: (item.quantidade || 0) + 1 };
          }
        }
        return item;
      })
    );
  }

  function decreaseQuantity(id: number) {
    setCart((old) =>
      old
        .map((item) => {
          if (item.id === id) {
            if (item.fracionado) {
              return { ...item, quantidadeKg: (item.quantidadeKg || 0) - 0.5 };
            } else {
              return { ...item, quantidade: (item.quantidade || 0) - 1 };
            }
          }
          return item;
        })
        .filter((item) => {
          if (item.fracionado) {
            return (item.quantidadeKg || 0) > 0;
          }
          return (item.quantidade || 0) > 0;
        })
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}