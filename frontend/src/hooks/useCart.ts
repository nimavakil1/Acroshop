"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { medusaClient } from "@/lib/medusa";

interface CartItem {
  id: string;
  variant_id: string | null;
  title: string;
  quantity: number;
  unit_price: number;
  thumbnail?: string | null;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
      total: 0,
      isLoading: false,
      error: null,

      initializeCart: async () => {
        const { cartId } = get();

        if (cartId) {
          // Try to fetch existing cart
          try {
            const { cart } = await medusaClient.carts.retrieve(cartId);
            set({
              items: cart.items || [],
              itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
              subtotal: cart.subtotal || 0,
              total: cart.total || 0,
            });
            return;
          } catch {
            // Cart doesn't exist anymore, create new one
          }
        }

        // Create new cart
        try {
          const { cart } = await medusaClient.carts.create({});
          set({
            cartId: cart.id,
            items: [],
            itemCount: 0,
            subtotal: 0,
            total: 0,
          });
        } catch (error) {
          set({ error: "Failed to create cart" });
        }
      },

      addItem: async (variantId: string, quantity = 1) => {
        const { cartId } = get();
        set({ isLoading: true, error: null });

        try {
          let currentCartId = cartId;

          // Create cart if it doesn't exist
          if (!currentCartId) {
            const { cart } = await medusaClient.carts.create({});
            currentCartId = cart.id;
            set({ cartId: cart.id });
          }

          // Add item to cart
          const { cart } = await medusaClient.carts.lineItems.create(currentCartId, {
            variant_id: variantId,
            quantity,
          });

          set({
            items: cart.items || [],
            itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
            isLoading: false,
          });
        } catch (error) {
          set({ error: "Failed to add item to cart", isLoading: false });
        }
      },

      updateQuantity: async (lineItemId: string, quantity: number) => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true, error: null });

        try {
          const { cart } = await medusaClient.carts.lineItems.update(
            cartId,
            lineItemId,
            { quantity }
          );

          set({
            items: cart.items || [],
            itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
            isLoading: false,
          });
        } catch (error) {
          set({ error: "Failed to update quantity", isLoading: false });
        }
      },

      removeItem: async (lineItemId: string) => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true, error: null });

        try {
          const { cart } = await medusaClient.carts.lineItems.delete(cartId, lineItemId);

          set({
            items: cart.items || [],
            itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
            isLoading: false,
          });
        } catch (error) {
          set({ error: "Failed to remove item", isLoading: false });
        }
      },

      clearCart: () => {
        set({
          cartId: null,
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
        });
      },

      refreshCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        try {
          const { cart } = await medusaClient.carts.retrieve(cartId);
          set({
            items: cart.items || [],
            itemCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
          });
        } catch (error) {
          // Cart might be invalid, clear it
          get().clearCart();
        }
      },
    }),
    {
      name: "acropaq-cart",
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
);
