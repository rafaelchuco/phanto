import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewAPI } from '../services/api';

export const useProductReviews = (slug) => {
  return useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => reviewAPI.getProductReviews(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => reviewAPI.getMyReviews(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => reviewAPI.createReview(reviewData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productSlug] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reviewData }) => reviewAPI.updateReview(id, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => reviewAPI.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};