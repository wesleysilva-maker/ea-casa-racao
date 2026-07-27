"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import CheckoutModal from "./CheckoutModal";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const total = cart.reduce((acc, item) => {
    if (item.fracionado) {
      return acc + item.preco * (item.quantidadeKg || 0);
    }
    return acc + item.preco * (item.quantidade || 0);
  }, 0);

  return (
    <>
      {/* Botão do carrinho */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-orange-600 hover:bg-orange-700 text-white rounded-full w-16 h-16 shadow-xl text-2xl"
      >
        🛒
      </button>

      {/* Fundo escuro */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Carrinho */}
      <div
        className={`
          fixed
          z-[60]
          bg-white
          shadow-2xl
          transition-all
          duration-300

          bottom-0
          left-0
          w-full
          rounded-t-3xl
          max-h-[85vh]

          md:left-auto
          md:right-5
          md:bottom-5
          md:w-[360px]
          md:rounded-2xl

          ${open ? "translate-y-0" : "translate-y-full md:translate-y-0 md:right-[-420px]"}
        `}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-2xl font-bold">
            Carrinho
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-4xl leading-none text-gray-600 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Lista */}
        <div className="max-h-[45vh] overflow-y-auto px-5">

          {cart.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Carrinho vazio.
            </div>
          ) : (
            cart.map((item) => {
              const qty = item.fracionado ? (item.quantidadeKg || 0) : (item.quantidade || 0);
              const subtotal = item.preco * qty;

              return (
                <div
                  key={item.id}
                  className="border-b py-4 flex justify-between gap-3"
                >
                  <div className="flex-1">

                    <h4 className="font-bold">
                      {item.nome}
                    </h4>

                    <p className="text-orange-600 font-bold mt-1">
                      R$ {subtotal.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">

                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="w-8 h-8 rounded-full bg-gray-200"
                      >
                        -
                      </button>

                      <span className="font-bold">
                        {item.fracionado ? `${qty}kg` : qty}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="w-8 h-8 rounded-full bg-green-600 text-white"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-2xl"
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}

        </div>

        {/* Rodapé */}
        {cart.length > 0 && (
          <div className="border-t p-5">

            <h3 className="text-2xl font-bold text-green-700 mb-4">
              Total: R$ {total.toFixed(2)}
            </h3>

            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold"
            >
              Finalizar Pedido
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold"
            >
              Limpar Carrinho
            </button>

          </div>
        )}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}