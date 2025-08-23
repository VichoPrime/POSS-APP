// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const restoreCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem('cart', JSON.stringify(items)); // AGREGAR ESTA LÍNEA
  };

  const addToCart = (product: Product) => {
    // Verificar stock
    if (product.stock <= 0) {
      throw new Error('Producto sin stock disponible');
    }

    // Verificar si ya existe en el carrito
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      // Si existe, aumentar quantity
      const newCart = [...cart];
      const currentQuantity = newCart[existingIndex].quantity;
      
      if (currentQuantity >= product.stock) {
        throw new Error(`Stock máximo alcanzado (${product.stock})`);
      }
      
      newCart[existingIndex].quantity += 1;
      saveCart(newCart); // Usar saveCart para guardar en localStorage
    } else {
      // Si no existe, agregar nuevo item
      const cartItem: CartItem = {
        ...product,
        quantity: 1
      };
      saveCart([...cart, cartItem]); // Usar saveCart
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    saveCart(newCart);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const item = cart[index];
    if (newQuantity > item.stock) {
      throw new Error('Stock insuficiente');
    }

    const newCart = cart.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    restoreCart
  };
};