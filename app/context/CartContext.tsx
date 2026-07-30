"use client";

import { createContext, useContext, useState } from "react";

type Product = {
  id: number;
  nome: string;
  categoria?: string;
  preco: number;
  imagem: string;
  estoque?: number;
  estoque_kg?: number;
  peso_saco?: number;
  fracionado?: boolean;
  promocao?: boolean;
};

export type CartItem = Product & {
  quantidade?: number;
  quantidadeGramas?: number;
};

type CartContextType = {
  cart: CartItem[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addToCart: (product: Product, quantidadeGramas?: number) => void;
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
  const [open, setOpen] = useState(false);

  function addToCart(product: Product, quantidadeGramas?: number) {
    // Abre automaticamente o carrinho
    setOpen(true);

    setCart((old) => {
      const existe = old.find((item) => item.id === product.id);

      if (existe) {
        if (product.fracionado && quantidadeGramas) {
          return old.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantidadeGramas:
                    (item.quantidadeGramas || 0) + quantidadeGramas,
                }
              : item
          );
        }

        return old.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantidade: (item.quantidade || 0) + 1,
              }
            : item
        );
      }

      if (product.fracionado && quantidadeGramas) {
        const precoPorKg = product.preco / (product.peso_saco || 1);

        return [
          ...old,
          {
            ...product,
            quantidadeGramas,
            preco: precoPorKg,
          },
        ];
      }

      return [
        ...old,
        {
          ...product,
          quantidade: 1,
        },
      ];
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
            return {
              ...item,
              quantidadeGramas: (item.quantidadeGramas || 0) + 100,
            };
          }

          return {
            ...item,
            quantidade: (item.quantidade || 0) + 1,
          };
        }

        return item;
      })
    );
  }

  function decreaseQuantity(id: number) {
    setCart((old) =>
      old
        .map((item) => {
          if (item.id !== id) return item;

          if (item.fracionado) {
            return {
              ...item,
              quantidadeGramas: Math.max(
                0,
                (item.quantidadeGramas || 0) - 100
              ),
            };
          }

          return {
            ...item,
            quantidade: Math.max(0, (item.quantidade || 0) - 1),
          };
        })
        .filter((item) => {
          if (item.fracionado) {
            return (item.quantidadeGramas || 0) > 0;
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
        open,
        setOpen,
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