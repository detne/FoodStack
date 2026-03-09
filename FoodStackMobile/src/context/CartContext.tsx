import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, UseCartReturn } from '../hooks/useCart';

const CartContext = createContext<UseCartReturn | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cartValue = useCart();

  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = (): UseCartReturn => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};