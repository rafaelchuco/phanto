import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, reviewAPI, categoryAPI, brandAPI, materialAPI } from '../services/api';

// --- Products ---

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productAPI.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductDetail = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedProducts = (slug) => {
  return useQuery({
    queryKey: ['relatedProducts', slug],
    queryFn: () => productAPI.getRelated(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

export const useBestSellers = () => {
  return useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productAPI.getBestSellers(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productAPI.getFeatured(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useNewProducts = () => {
  return useQuery({
    queryKey: ['newProducts'],
    queryFn: () => productAPI.getNew(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => productAPI.update(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', slug]);
    },
  });
};

export const usePatchProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => productAPI.patch(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', slug]);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => productAPI.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};

export const useIncrementProductView = () => {
  return useMutation({
    mutationFn: (slug) => productAPI.incrementView(slug),
  });
};

// --- Categories ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCategory = (slug) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryAPI.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useCategoryProducts = (slug) => {
  return useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: () => categoryAPI.getProducts(slug),
    enabled: !!slug,
  });
};

export const useSubcategories = (slug) => {
  return useQuery({
    queryKey: ['subcategories', slug],
    queryFn: () => categoryAPI.getSubcategories(slug),
    enabled: !!slug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => categoryAPI.update(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['category', slug]);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => categoryAPI.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });
};

// --- Brands ---

export const useBrands = (params = {}) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandAPI.getAll(params),
    staleTime: 1000 * 60 * 60,
  });
};

export const useBrand = (slug) => {
  return useQuery({
    queryKey: ['brand', slug],
    queryFn: () => brandAPI.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => brandAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => brandAPI.update(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries(['brands']);
      queryClient.invalidateQueries(['brand', slug]);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => brandAPI.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['brands']);
    },
  });
};

// --- Materials ---

export const useMaterials = (params = {}) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialAPI.getAll(params),
    staleTime: 1000 * 60 * 60,
  });
};

export const useMaterial = (id) => {
  return useQuery({
    queryKey: ['material', id],
    queryFn: () => materialAPI.getById(id),
    enabled: !!id,
  });
};

// --- Reviews ---

export const useProductReviews = (slug) => {
  return useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => reviewAPI.getProductReviews(slug),
    enabled: !!slug,
  });
};

export const useAllReviews = () => {
  return useQuery({
    queryKey: ['allReviews'],
    queryFn: () => reviewAPI.getAll(),
  });
};

export const useReview = (id) => {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewAPI.getById(id),
    enabled: !!id,
  });
};

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['myReviews'],
    queryFn: () => reviewAPI.getMyReviews(),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => reviewAPI.createReview(reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['reviews', variables.productSlug]);
      queryClient.invalidateQueries(['product', variables.productSlug]);
      queryClient.invalidateQueries(['myReviews']);
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => reviewAPI.updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['myReviews']);
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => reviewAPI.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['myReviews']);
    },
  });
};