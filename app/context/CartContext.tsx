"use client";

import { createContext, useContext, useState } from "react";

type Product = {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
};

export type CartItem = Product & {
  quantidade: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
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

  function addToCart(product: Product) {
    setCart((old) => {
      const existe = old.find((item) => item.id === product.id);

      if (existe) {
        return old.map((item) =>
          item.id === product.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...old, { ...product, quantidade: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((old) => old.filter((item) => item.id !== id));
  }

  function increaseQuantity(id: number) {
    setCart((old) =>
      old.map((item) =>
        item.id === id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id: number) {
    setCart((old) =>
      old
        .map((item) =>
          item.id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
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