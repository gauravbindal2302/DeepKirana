import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "deepstore_cart_items";

function getInitialCartItems() {
  try {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY);
    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error("Failed to parse cart items from storage:", error);
    return [];
  }
}

function persistCartItems(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to persist cart items:", error);
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const incomingItem = action.payload;
      const existingItem = state.items.find(
        (item) => item.id === incomingItem.id && item.weight === incomingItem.weight
      );

      let updatedItems = [];
      if (existingItem) {
        updatedItems = state.items.map((item) =>
          item.id === incomingItem.id && item.weight === incomingItem.weight
            ? { ...item, quantity: item.quantity + incomingItem.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, incomingItem];
      }

      persistCartItems(updatedItems);
      return { ...state, items: updatedItems };
    }

    case "UPDATE_QUANTITY": {
      const { id, weight, quantity } = action.payload;
      const updatedItems = state.items.map((item) =>
        item.id === id && item.weight === weight
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );
      persistCartItems(updatedItems);
      return { ...state, items: updatedItems };
    }

    case "REMOVE_ITEM": {
      const { id, weight } = action.payload;
      const updatedItems = state.items.filter(
        (item) => !(item.id === id && item.weight === weight)
      );
      persistCartItems(updatedItems);
      return { ...state, items: updatedItems };
    }

    case "CLEAR_CART": {
      persistCartItems([]);
      return { ...state, items: [] };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: getInitialCartItems() });

  const value = useMemo(
    () => ({
      items: state.items,
      itemCount: state.items.reduce((acc, item) => acc + item.quantity, 0),
      addToCart: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      updateQuantity: (id, weight, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, weight, quantity } }),
      removeFromCart: (id, weight) =>
        dispatch({ type: "REMOVE_ITEM", payload: { id, weight } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state.items]
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
