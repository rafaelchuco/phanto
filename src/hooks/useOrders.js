import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../services/api';

export const useOrders = () => {
    const queryClient = useQueryClient();

    // Queries
    const useGetOrders = () => useQuery({
        queryKey: ['orders'],
        queryFn: () => orderAPI.getAll(),
        staleTime: 1000 * 60 * 5,
    });

    const useGetOrder = (orderNumber) => useQuery({
        queryKey: ['order', orderNumber],
        queryFn: () => orderAPI.getById(orderNumber),
        enabled: !!orderNumber,
    });

    const useGetInvoice = (orderNumber) => useQuery({
        queryKey: ['invoice', orderNumber],
        queryFn: () => orderAPI.getInvoice(orderNumber),
        enabled: !!orderNumber,
        retry: false,
    });

    // Mutations
    const createOrderMutation = useMutation({
        mutationFn: (orderData) => orderAPI.create(orderData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['cart'] }); // Invalidate cart as it might be cleared
        },
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ orderNumber, orderData }) => orderAPI.update(orderNumber, orderData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderNumber] });
        },
    });

    const patchOrderMutation = useMutation({
        mutationFn: ({ orderNumber, orderData }) => orderAPI.patch(orderNumber, orderData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderNumber] });
        },
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (orderNumber) => orderAPI.delete(orderNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const cancelOrderMutation = useMutation({
        mutationFn: (orderNumber) => orderAPI.cancel(orderNumber),
        onSuccess: (_, orderNumber) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', orderNumber] });
        },
    });

    const confirmPaymentMutation = useMutation({
        mutationFn: ({ paymentIntentId, orderData }) => orderAPI.confirmPayment(paymentIntentId, orderData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const validateCouponMutation = useMutation({
        mutationFn: (code) => orderAPI.validateCoupon(code),
    });

    return {
        // Hooks for components to use directly
        useGetOrders,
        useGetOrder,
        useGetInvoice,

        // Exposed mutations
        createOrder: createOrderMutation.mutate,
        createOrderAsync: createOrderMutation.mutateAsync,
        updateOrder: updateOrderMutation.mutate,
        updateOrderAsync: updateOrderMutation.mutateAsync,
        patchOrder: patchOrderMutation.mutate,
        patchOrderAsync: patchOrderMutation.mutateAsync,
        deleteOrder: deleteOrderMutation.mutate,
        deleteOrderAsync: deleteOrderMutation.mutateAsync,
        cancelOrder: cancelOrderMutation.mutate,
        cancelOrderAsync: cancelOrderMutation.mutateAsync,
        confirmPayment: confirmPaymentMutation.mutate,
        confirmPaymentAsync: confirmPaymentMutation.mutateAsync,
        validateCoupon: validateCouponMutation.mutate,
        validateCouponAsync: validateCouponMutation.mutateAsync,

        // Loading states
        isCreating: createOrderMutation.isPending,
        isUpdating: updateOrderMutation.isPending,
        isPatching: patchOrderMutation.isPending,
        isDeleting: deleteOrderMutation.isPending,
        isCancelling: cancelOrderMutation.isPending,
        isConfirmingPayment: confirmPaymentMutation.isPending,
        isValidatingCoupon: validateCouponMutation.isPending,

        // Errors
        createError: createOrderMutation.error,
        updateError: updateOrderMutation.error,
        patchError: patchOrderMutation.error,
        deleteError: deleteOrderMutation.error,
        cancelError: cancelOrderMutation.error,
        confirmPaymentError: confirmPaymentMutation.error,
        validateCouponError: validateCouponMutation.error,
    };
};
