"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { persist } from "zustand/middleware";
import { ReactNode, createContext, useContext } from "react";
import { calculateCartMeta } from "@/lib/utils";

export interface CartItem extends IProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (
    product: IProduct,
    quantity?: number
  ) => { success: boolean; added: number; discarded: number };
  removeItem: (id: string) => void;
  updateQuantity: (
    id: string,
    quantity: number
  ) => { success: boolean; actualQuantity: number };
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const MAX_CART_ITEMS = 10;

const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: IProduct, quantity: number = 1) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === product.id);

        let added = 0;
        let discarded = 0;
        const { availableSpace } = calculateCartMeta(state.items);

        if (existingItem) {
          // Item already exists
          const maxPossible = Math.min(
            existingItem.quantity + quantity,
            existingItem.quantity + availableSpace
          );
          added = maxPossible - existingItem.quantity;
          discarded = quantity - added;

          if (added > 0) {
            const updatedItems = state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: existingItem.quantity + added }
                : item
            );

            set({
              items: updatedItems,
              isOpen: true,
            });
          }
        } else {
          // New item
          added = Math.min(quantity, availableSpace);
          discarded = quantity - added;

          if (added > 0) {
            const newItem = { ...product, quantity: added };
            const updatedItems = [...state.items, newItem];

            set({
              items: updatedItems,
              isOpen: true,
            });
          }
        }

        const result = { success: added > 0, added, discarded };
        if (result.success) {
          if (result.discarded > 0) {
            toast.warning("Cart limit reached! ⚠️", {
              description: `${result.added} × ${product.name} added to cart. ${result.discarded} items discarded (max 10 items allowed).`,
            });
          } else {
            toast.success(`${product.name} has been added to your cart.`, {
              description: "You can continue shopping or proceed to checkout.",
            });
          }
        } else {
          toast.error("Cart is full! 🛒", {
            description:
              "Your cart has reached the maximum limit of 10 items. Please remove some items to add more.",
          });
        }
        return result;
      },

      removeItem: (id: string) => {
        const state = get();
        const updatedItems = state.items.filter((item) => item.id !== id);
        set({ items: updatedItems });
      },

      updateQuantity: (id: string, quantity: number) => {
        const state = get();
        const currentItem = state.items.find((item) => item.id === id);

        if (!currentItem) {
          return { success: false, actualQuantity: 0 };
        }

        const { availableSpace } = calculateCartMeta(state.items);
        const actualQuantity = Math.min(Math.max(0, quantity), availableSpace);

        const updatedItems = state.items
          .map((item) =>
            item.id === id ? { ...item, quantity: actualQuantity } : item
          )
          .filter((item) => item.quantity > 0);

        set({
          items: updatedItems,
        });

        const result = { success: true, actualQuantity };
        if (!result.success) {
          toast.error("Unable to update item quantity!", {
            description: "Please try again or contact support.",
          });
        } else if (result.actualQuantity !== quantity) {
          toast.warning("Cart limit reached! ⚠️!", {
            description: `Quantity limited to ${result.actualQuantity} (max ${MAX_CART_ITEMS} items allowed).`,
          });
        }
        return result;
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      setCartOpen: (open: boolean) => {
        set({ isOpen: open });
      },
    }),
    {
      name: "perfume-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Context for backward compatibility (if needed)
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: IProduct,
    quantity?: number
  ) => { success: boolean; added: number; discarded: number };
  removeItem: (id: string) => void;
  updateQuantity: (
    id: string,
    quantity: number
  ) => { success: boolean; actualQuantity: number };
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cartStore = useCartStore();

  return (
    <CartContext.Provider value={cartStore}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
