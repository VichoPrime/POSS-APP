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

  const addToCart = (product: Product, customQuantity?: number) => {
    // Determinar la cantidad a agregar - para productos por peso debe pasarse customQuantity
    const quantityToAdd = customQuantity || 1;
    
    // Verificar stock
    if (product.stock <= 0) {
      alert(`⚠️ Producto sin stock\n\nEl producto "${product.title}" no tiene stock disponible.`);
      return;
    }

    // Verificar si ya existe en el carrito
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      // Si existe, aumentar quantity por la cantidad especificada
      const newCart = [...cart];
      const currentQuantity = newCart[existingIndex].quantity;
      const newQuantity = currentQuantity + quantityToAdd;
      
      if (newQuantity > product.stock) {
        const available = product.stock - currentQuantity;
        alert(`⚠️ Stock insuficiente\n\nProducto: ${product.title}\nYa tienes: ${currentQuantity}${product.unit_type === 'peso' ? 'kg' : ' unidades'} en el carrito\nStock disponible para agregar: ${available}${product.unit_type === 'peso' ? 'kg' : ' unidades'}`);
        return;
      }
      
      newCart[existingIndex].quantity = newQuantity;
      saveCart(newCart);
    } else {
      // Si no existe, agregar nuevo item con la cantidad especificada
      if (quantityToAdd > product.stock) {
        alert(`⚠️ Stock insuficiente\n\nProducto: ${product.title}\nStock disponible: ${product.stock}${product.unit_type === 'peso' ? 'kg' : ' unidades'}\nCantidad solicitada: ${quantityToAdd}${product.unit_type === 'peso' ? 'kg' : ' unidades'}`);
        return;
      }
      
      const cartItem: CartItem = {
        ...product,
        quantity: quantityToAdd
      };
      saveCart([...cart, cartItem]);
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
      alert(`⚠️ Stock insuficiente\n\nProducto: ${item.title}\nStock disponible: ${item.stock} unidades\nCantidad solicitada: ${newQuantity} unidades`);
      return; // No actualizar la cantidad, mantener la actual
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