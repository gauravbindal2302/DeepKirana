import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const CART_STORAGE_KEY_PREFIX = "deepstore_cart_items";

function getStorageKey(userId) {
  return `${CART_STORAGE_KEY_PREFIX}:${userId || "guest"}`;
}

function readCartItems(storageKey) {
  try {
    const storedItems = localStorage.getItem(storageKey);
    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error("Failed to parse cart items from storage:", error);
    return [];
  }
}

function persistCartItems(storageKey, items) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to persist cart items:", error);
  }
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const userCartKey = getStorageKey(isAuthenticated ? user?.id : "guest");
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(readCartItems(userCartKey));
  }, [userCartKey]);

  const updateItems = useCallback((updater) => {
    setItems((prevItems) => {
      const nextItems = typeof updater === "function" ? updater(prevItems) : updater;
      persistCartItems(userCartKey, nextItems);
      return nextItems;
    });
  }, [userCartKey]);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      addToCart: (incomingItem) =>
        updateItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) => item.id === incomingItem.id && item.weight === incomingItem.weight
          );
          if (existingItem) {
            return prevItems.map((item) =>
              item.id === incomingItem.id && item.weight === incomingItem.weight
                ? { ...item, quantity: item.quantity + incomingItem.quantity }
                : item
            );
          }
          return [...prevItems, incomingItem];
        }),
      updateQuantity: (id, weight, quantity) =>
        updateItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id && item.weight === weight
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          )
        ),
      removeFromCart: (id, weight) =>
        updateItems((prevItems) =>
          prevItems.filter((item) => !(item.id === id && item.weight === weight))
        ),
      clearCart: () => updateItems([]),
    }),
    [items, updateItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
