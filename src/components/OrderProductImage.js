import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../services/api';
import { getProductPrimaryImage } from '../utils/productImages';

const OrderProductImage = ({ productId, productName, fallbackImage }) => {
    const { data: product, isLoading } = useQuery({
        queryKey: ['product', 'id', productId],
        queryFn: async () => {
            // Fetch product by ID using the filter endpoint
            const results = await productAPI.getAll({ id: productId });
            return results && results.length > 0 ? results[0] : null;
        },
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                <span className="text-xs text-gray-400">...</span>
            </div>
        );
    }

    // Use fetched product image, or fallback from order item, or default placeholder
    const imageSrc = product
        ? getProductPrimaryImage(product)
        : (fallbackImage || 'https://placehold.co/100x100?text=No+Image');

    return (
        <img
            src={imageSrc}
            alt={productName}
            className="w-full h-full object-cover"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/100x100?text=No+Image';
            }}
        />
    );
};

export default OrderProductImage;
