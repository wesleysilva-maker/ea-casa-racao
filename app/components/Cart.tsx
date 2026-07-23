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

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  return (
    <><button
  onClick={() => setOpen(!open)}
  className="fixed bottom-28 left-4 z-50 bg-orange-600 hover:bg-orange-700 text-white rounded-full w-16 h-16 shadow-xl text-2xl"
>
  🛒
</button>
      <div
  className={`
    fixed
    right-4
    bottom-24
    w-[calc(100%-2rem)]
    max-w-sm
    bg-white
    rounded-2xl
    shadow-2xl
    p-5
    border
    z-50
    transition-all
    ${open ? "block" : "hidden"}
  `}
>

        <h2 className="text-2xl font-bold mb-5">
          Carrinho
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">
            Carrinho vazio.
          </p>
        ) : (
          <>

            {cart.map((item) => (

              <div
                key={item.id}
                className="border-b py-4 flex justify-between gap-3"
              >

                <div className="flex-1">

                  <h4 className="font-bold">
                    {item.nome}
                  </h4>

                  <p className="text-orange-600 font-bold mt-1">
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">

                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full font-bold"
                    >
                      -
                    </button>

                    <span className="font-bold">
                      {item.quantidade}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="bg-green-600 hover:bg-green-700 text-white w-8 h-8 rounded-full font-bold"
                    >
                      +
                    </button>

                  </div>

                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-xl font-bold"
                >
                  ✕
                </button>

              </div>

            ))}

            <div className="mt-6">

              <h3 className="text-2xl font-bold text-green-700">
                Total: R$ {total.toFixed(2)}
              </h3>

            </div>

            <button
              onClick={() => {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  setCheckoutOpen(true);
}}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold"
            >
              Finalizar Pedido
            </button>

            <button
              onClick={clearCart}
              className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold"
            >
              Limpar Carrinho
            </button>

          </>
        )}

      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

    </>
  );
}