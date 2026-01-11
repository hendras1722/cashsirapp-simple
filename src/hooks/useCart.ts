import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number | string;
  title: string;
  price: number;
  quantity: number;
  min: number;
  thumbnail: string;
};

type CartState = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: CartItem["id"]) => void;
  updateQuantity: (id: CartItem["id"], qty: number) => void;
  clearCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) =>
        set((state) => {
          const exist = state.items.find((i) => i.id === item.id);

          if (exist) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: qty }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, qty) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage",
    }
  )
);
