import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCartAPI } from '../hooks/useCart';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const cartAPI = useCartAPI();
  const [localCart, setLocalCart] = useState([]);

  // Sincronizar carrito de API con localStorage
  useEffect(() => {
    if (cartAPI.cart && cartAPI.cart.items) {
      // Transformar items de API al formato local
      const transformedItems = cartAPI.cart.items.map(item => ({
        id: item.product.id,
        nombre: item.product.name,
        precio: item.product.final_price || item.product.price,
        cantidad: item.quantity,
        slug: item.product.slug,
        category: item.product.category?.name,
        stock: item.product.stock,
      }));

      setLocalCart(transformedItems);
      localStorage.setItem('cart', JSON.stringify(transformedItems));
    }
  }, [cartAPI.cart]);

  const getCartCount = () => {
    return localCart.reduce((sum, item) => sum + item.cantidad, 0);
  };

  const getTotalPrice = () => {
    return localCart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  return (
    <CartContext.Provider
      value={{
        // Datos del carrito
        cartItems: localCart,
        cart: cartAPI.cart,
        isLoading: cartAPI.isLoading,
        error: cartAPI.error,

        // Métodos de acceso
        getCartCount,
        getTotalPrice,

        // Métodos del API
        // Métodos del API
        addItem: cartAPI.addItem,
        addItemAsync: cartAPI.addItemAsync,
        updateItem: cartAPI.updateItem,
        updateItemAsync: cartAPI.updateItemAsync,
        updateItemPut: cartAPI.updateItemPut,
        updateItemPutAsync: cartAPI.updateItemPutAsync,
        removeItem: cartAPI.removeItem,
        removeItemAsync: cartAPI.removeItemAsync,
        clearCart: cartAPI.clearCart,
        clearCartAsync: cartAPI.clearCartAsync,
        refetch: cartAPI.refetch,

        // Wishlist
        wishlist: cartAPI.wishlist,
        addToWishlist: cartAPI.addToWishlist,
        addToWishlistAsync: cartAPI.addToWishlistAsync,
        updateWishlistItem: cartAPI.updateWishlistItem,
        updateWishlistItemAsync: cartAPI.updateWishlistItemAsync,
        patchWishlistItem: cartAPI.patchWishlistItem,
        patchWishlistItemAsync: cartAPI.patchWishlistItemAsync,
        removeWishlistItem: cartAPI.removeWishlistItem,
        removeWishlistItemAsync: cartAPI.removeWishlistItemAsync,
        moveWishlistItemToCart: cartAPI.moveWishlistItemToCart,
        moveWishlistItemToCartAsync: cartAPI.moveWishlistItemToCartAsync,

        // Estados de carga
        isAddingItem: cartAPI.isAddingItem,
        isUpdatingItem: cartAPI.isUpdatingItem,
        isRemovingItem: cartAPI.isRemovingItem,
        isClearingCart: cartAPI.isClearingCart,

        // Estados de carga Wishlist
        wishlistLoading: cartAPI.wishlistLoading,
        wishlistError: cartAPI.wishlistError,
        isAddingToWishlist: cartAPI.isAddingToWishlist,
        isUpdatingWishlist: cartAPI.isUpdatingWishlist,
        isPatchingWishlist: cartAPI.isPatchingWishlist,
        isRemovingWishlist: cartAPI.isRemovingWishlist,
        isMovingWishlist: cartAPI.isMovingWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};