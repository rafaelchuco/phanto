import { useQuery } from '@tanstack/react-query';
import { brandAPI } from '../services/api';

export const useBrands = (params = {}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandAPI.getAll(params),
    staleTime: 1000 * 60 * 10,
  });
};

export const useBrandDetail = (slug) => {
  return useQuery({
    queryKey: ['brand', slug],
    queryFn: () => brandAPI.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};