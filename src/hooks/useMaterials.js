import { useQuery } from '@tanstack/react-query';
import { materialAPI } from '../services/api';

export const useMaterials = (params = {}) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialAPI.getAll(params),
    staleTime: 1000 * 60 * 10,
  });
};