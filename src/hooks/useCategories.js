// src/hooks/useCategories.js
import { useQuery } from '@tanstack/react-query';
import { categoryAPI, fetchAPI } from '../services/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutos (no cambian frecuentemente)
  });
};

export const useCategoryDetail = (slug) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryAPI.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

export const useCategoryProducts = (slug, filters = {}) => {
  return useQuery({
    queryKey: ['categoryProducts', slug, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros a la query
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const endpoint = `/api/products/categories/${slug}/products/${queryString ? `?${queryString}` : ''}`;
      
      const data = await fetchAPI(endpoint);
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });
};