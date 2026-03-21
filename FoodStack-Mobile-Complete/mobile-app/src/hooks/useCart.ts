import { useState, useCallback } from 'react';
import { CartItem, MenuItem, CustomizationOption } from '../types';

export interface UseCartReturn {
  cartItems: CartItem[];
  addToCart: (
    menuItem: MenuItem,
    quantity: number,
    selectedCustomizations: {
      group_id: string;
      group_name: string;
      options: CustomizationOption[];
    }[],
    notes?: string
  ) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const calculateItemPrice = useCallback((
    menuItem: MenuItem,
    quantity: number,
    selectedCustomizations: {
      group_id: string;
      group_name: string;
      options: CustomizationOption[];
    }[]
  ): number => {
    let basePrice = menuItem.price * quantity;
    
    // Add customization costs
    const customizationCost = selectedCustomizations.reduce((total, group) => {
      return total + group.options.reduce((groupTotal, option) => {
        return groupTotal + (option.price_delta * quantity);
      }, 0);
    }, 0);

    return basePrice + customizationCost;
  }, []);

  const addToCart = useCallback((
    menuItem: MenuItem,
    quantity: number,
    selectedCustomizations: {
      group_id: string;
      group_name: string;
      options: CustomizationOption[];
    }[],
    notes?: string
  ) => {
    const totalPrice = calculateItemPrice(menuItem, quantity, selectedCustomizations);
    
    const cartItem: CartItem = {
      menu_item: menuItem,
      quantity,
      notes,
      selected_customizations: selectedCustomizations,
      total_price: totalPrice,
    };

    setCartItems(prev => [...prev, cartItem]);
  }, [calculateItemPrice]);

  const removeFromCart = useCallback((index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCartItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newTotalPrice = calculateItemPrice(
          item.menu_item,
          quantity,
          item.selected_customizations
        );
        return {
          ...item,
          quantity,
          total_price: newTotalPrice,
        };
      }
      return item;
    }));
  }, [calculateItemPrice, removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  }, [cartItems]);

  const getTotalItems = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};