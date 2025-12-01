import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartAPI } from '../services/api';

const CART_ID_KEY = 'ecommerce_cart_id';

export const useCartAPI = () => {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartAPI.get();
      console.log('📦 Carrito cargado:', data);

      if (data && data.id) {
        localStorage.setItem(CART_ID_KEY, data.id.toString());
      }

      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Wishlist query
  const { data: wishlist, isLoading: wishlistLoading, error: wishlistError } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const data = await cartAPI.getWishlist();
      console.log('📦 Wishlist cargado:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity }) => {
      console.log('🟢 useCart: Ejecutando mutación addItem', { productId, quantity });
      return cartAPI.addItem(productId, quantity);
    },

    onSuccess: () => {
      console.log('✅ Producto agregado, invalidando carrito...');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },

    onError: (err) => {
      console.error('❌ Error al agregar producto:', err);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => {
      console.log('🔵 Actualizando item (PATCH):', itemId, 'nueva cantidad:', quantity);
      return cartAPI.updateItem(itemId, quantity);
    },

    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old || !old.items) return old;

        const updatedItems = old.items.map(item =>
          item.id === itemId
            ? { ...item, quantity, subtotal: item.unit_price * quantity }
            : item
        );

        const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...old,
          items: updatedItems,
          total_price: newTotalPrice,
          total_items: newTotalItems,
        };
      });

      return { previousCart };
    },

    onError: (err, variables, context) => {
      console.error('❌ Error al actualizar, revirtiendo...', err);
      queryClient.setQueryData(['cart'], context.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateItemPutMutation = useMutation({
    mutationFn: ({ itemId, data }) => {
      console.log('🔵 Actualizando item (PUT):', itemId, data);
      return cartAPI.updateItemPut(itemId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => console.error('❌ Error al actualizar item (PUT):', err),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => {
      console.log('🗑️ Eliminando item:', itemId);
      return cartAPI.removeItem(itemId);
    },

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        if (!old || !old.items) return old;

        const updatedItems = old.items.filter(item => item.id !== itemId);
        const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...old,
          items: updatedItems,
          total_price: newTotalPrice,
          total_items: newTotalItems,
          item_count: updatedItems.length,
        };
      });

      return { previousCart };
    },

    onError: (err, itemId, context) => {
      console.error('❌ Error al eliminar, revirtiendo...', err);
      queryClient.setQueryData(['cart'], context.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => {
      console.log('🗑️ Vaciando carrito completo');
      return cartAPI.clear();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => ({
        ...old,
        items: [],
        total_price: 0,
        total_items: 0,
        item_count: 0,
      }));

      return { previousCart };
    },

    onError: (err, variables, context) => {
      console.error('❌ Error al vaciar carrito, revirtiendo...', err);
      queryClient.setQueryData(['cart'], context.previousCart);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Wishlist mutations
  const addToWishlistMutation = useMutation({
    mutationFn: (productId) => cartAPI.addToWishlist(productId),
    onSuccess: () => {
      console.log('✅ Producto añadido a wishlist, invalidando wishlist...');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => console.error('❌ Error al añadir a wishlist:', err),
  });

  const updateWishlistMutation = useMutation({
    mutationFn: ({ id, data }) => cartAPI.updateWishlistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => console.error('❌ Error al actualizar wishlist:', err),
  });

  const patchWishlistMutation = useMutation({
    mutationFn: ({ id, data }) => cartAPI.patchWishlistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => console.error('❌ Error al parchear wishlist:', err),
  });

  const removeWishlistMutation = useMutation({
    mutationFn: (id) => cartAPI.removeWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => console.error('❌ Error al eliminar de wishlist:', err),
  });

  const moveWishlistToCartMutation = useMutation({
    mutationFn: (id) => cartAPI.moveWishlistItemToCart(id),
    onSuccess: () => {
      // After moving, refresh both cart and wishlist
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err) => console.error('❌ Error al mover wishlist al carrito:', err),
  });

  return {
    cart,
    wishlist,
    isLoading,
    wishlistLoading,
    error,
    wishlistError,
    refetch,

    // Cart actions
    addItem: addItemMutation.mutate,
    addItemAsync: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutate,
    updateItemAsync: updateItemMutation.mutateAsync,
    updateItemPut: updateItemPutMutation.mutate,
    updateItemPutAsync: updateItemPutMutation.mutateAsync,
    removeItem: removeItemMutation.mutate,
    removeItemAsync: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutate,
    clearCartAsync: clearCartMutation.mutateAsync,

    // Wishlist actions
    addToWishlist: addToWishlistMutation.mutate,
    addToWishlistAsync: addToWishlistMutation.mutateAsync,
    updateWishlistItem: updateWishlistMutation.mutate,
    updateWishlistItemAsync: updateWishlistMutation.mutateAsync,
    patchWishlistItem: patchWishlistMutation.mutate,
    patchWishlistItemAsync: patchWishlistMutation.mutateAsync,
    removeWishlistItem: removeWishlistMutation.mutate,
    removeWishlistItemAsync: removeWishlistMutation.mutateAsync,
    moveWishlistItemToCart: moveWishlistToCartMutation.mutate,
    moveWishlistItemToCartAsync: moveWishlistToCartMutation.mutateAsync,

    // Loading states
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isUpdatingWishlist: updateWishlistMutation.isPending,
    isPatchingWishlist: patchWishlistMutation.isPending,
    isRemovingWishlist: removeWishlistMutation.isPending,
    isMovingWishlist: moveWishlistToCartMutation.isPending,

    // Success / error flags
    addItemSuccess: addItemMutation.isSuccess,
    addItemError: addItemMutation.error,
    wishlistError,
  };
};