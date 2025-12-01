const API_BASE_URL = 'http://localhost:8000';

const getAuthToken = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { access } = JSON.parse(tokens);
    return access;
  }
  return null;
};

export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers,
      ...options,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Silenciar errores de paginación esperados
      const isExpectedPaginationError = errorData.detail === 'Invalid page.';

      if (!isExpectedPaginationError) {
        console.error('API Error Response:', errorData);
        console.error('Full error details:', JSON.stringify(errorData, null, 2));
      }

      let errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;

      if (typeof errorData === 'object') {
        const fieldErrors = Object.entries(errorData)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return `${field}: ${errors.join(', ')}`;
            }
            return `${field}: ${errors}`;
          })
          .join(' | ');

        if (fieldErrors) {
          errorMessage = fieldErrors;
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    // Solo loguear errores que no sean de paginación
    if (!error.message.includes('Invalid page')) {
      console.error('API Error:', error);
    }
    throw error;
  }
};

export const authAPI = {
  login: async (username, password) => {
    return fetchAPI('/api/users/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (userData) => {
    return fetchAPI('/api/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async (refresh) => {
    return fetchAPI('/api/users/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },
};

export const productAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/products/${queryString ? `?${queryString}` : ''}`;

    const data = await fetchAPI(endpoint);
    return data.results || data || [];
  },

  getBySlug: async (slug) => {
    return fetchAPI(`/api/products/${slug}/`);
  },

  getRelated: async (slug) => {
    const data = await fetchAPI(`/api/products/${slug}/related/`);
    return data.results || data || [];
  },

  getBestSellers: async () => {
    const data = await fetchAPI('/api/products/best_sellers/');
    return data.results || data || [];
  },

  getFeatured: async () => {
    const data = await fetchAPI('/api/products/featured/');
    return data.results || data || [];
  },

  getNew: async () => {
    const data = await fetchAPI('/api/products/new/');
    return data.results || data || [];
  },

  create: async (productData) => {
    return fetchAPI('/api/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (slug, productData) => {
    return fetchAPI(`/api/products/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  patch: async (slug, productData) => {
    return fetchAPI(`/api/products/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  },

  delete: async (slug) => {
    return fetchAPI(`/api/products/${slug}/`, {
      method: 'DELETE',
    });
  },

  incrementView: async (slug) => {
    return fetchAPI(`/api/products/${slug}/increment_view/`, {
      method: 'POST',
    });
  },
};

export const categoryAPI = {
  getAll: async () => {
    const data = await fetchAPI('/api/products/categories/');
    return data.results || data || [];
  },

  getBySlug: async (slug) => {
    return fetchAPI(`/api/products/categories/${slug}/`);
  },

  getProducts: async (slug) => {
    const data = await fetchAPI(`/api/products/categories/${slug}/products/`);
    return data.results || data || [];
  },

  getSubcategories: async (slug) => {
    const data = await fetchAPI(`/api/products/categories/${slug}/subcategories/`);
    return data.results || data || [];
  },

  create: async (categoryData) => {
    return fetchAPI('/api/products/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (slug, categoryData) => {
    return fetchAPI(`/api/products/categories/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  patch: async (slug, categoryData) => {
    return fetchAPI(`/api/products/categories/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (slug) => {
    return fetchAPI(`/api/products/categories/${slug}/`, {
      method: 'DELETE',
    });
  },
};

export const cartAPI = {
  get: async () => {
    return fetchAPI('/api/cart/');
  },

  addItem: async (productId, quantity = 1) => {
    console.log('🔵 Enviando a API:', { product_id: productId, quantity });
    return fetchAPI('/api/cart/items/', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });
  },

  updateItem: async (itemId, quantity) => {
    console.log('🔵 Actualizando item (PATCH):', itemId, 'cantidad:', quantity);
    return fetchAPI(`/api/cart/${itemId}/update/`, {
      method: 'PATCH',
      body: JSON.stringify({
        quantity: quantity,
      }),
    });
  },
  // PUT update (full replace) for cart item
  updateItemPut: async (itemId, data) => {
    console.log('🔵 Actualizando item (PUT):', itemId, data);
    return fetchAPI(`/api/cart/${itemId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  removeItem: async (itemId) => {
    console.log('🔵 Eliminando item:', itemId);
    return fetchAPI(`/api/cart/${itemId}/remove/`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return fetchAPI('/api/cart/clear/', {
      method: 'DELETE',
    });
  },
  // Wishlist endpoints
  getWishlist: async () => {
    return fetchAPI('/api/cart/wishlist/');
  },
  addToWishlist: async (productId) => {
    return fetchAPI('/api/cart/wishlist/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },
  getWishlistItem: async (id) => {
    return fetchAPI(`/api/cart/wishlist/${id}/`);
  },
  updateWishlistItem: async (id, data) => {
    return fetchAPI(`/api/cart/wishlist/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  patchWishlistItem: async (id, data) => {
    return fetchAPI(`/api/cart/wishlist/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  removeWishlistItem: async (id) => {
    return fetchAPI(`/api/cart/wishlist/${id}/`, {
      method: 'DELETE',
    });
  },
  moveWishlistItemToCart: async (id) => {
    return fetchAPI(`/api/cart/wishlist/${id}/move-to-cart/`, {
      method: 'POST',
    });
  },
};

export const userAPI = {
  getProfile: async () => {
    const data = await fetchAPI('/api/users/profile/');
    return data.results?.[0] || data;
  },

  updateProfile: async (profileData) => {
    return fetchAPI('/api/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (oldPassword, newPassword, newPassword2) => {
    return fetchAPI('/api/users/change-password/', {
      method: 'PATCH',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      }),
    });
  },

  getAddresses: async () => {
    const data = await fetchAPI('/api/users/addresses/');
    return data.results || data || [];
  },

  createAddress: async (addressData) => {
    return fetchAPI('/api/users/addresses/', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  updateAddress: async (id, addressData) => {
    return fetchAPI(`/api/users/addresses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (id) => {
    return fetchAPI(`/api/users/addresses/${id}/`, {
      method: 'DELETE',
    });
  },
};

export const orderAPI = {
  getAll: async () => {
    const data = await fetchAPI('/api/orders/');
    return data.results || data || [];
  },

  getById: async (orderNumber) => {
    return fetchAPI(`/api/orders/${orderNumber}/`);
  },

  create: async (orderData) => {
    return fetchAPI('/api/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  confirmPayment: async (paymentIntentId, orderData) => {
    console.log('🔵 Confirmando pago con:', { payment_intent_id: paymentIntentId, order: orderData });
    return fetchAPI('/api/orders/confirm-payment/', {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        order: orderData,
      }),
    });
  },

  cancel: async (orderNumber) => {
    return fetchAPI(`/api/orders/${orderNumber}/cancel/`, {
      method: 'PUT',
    });
  },

  update: async (orderNumber, orderData) => {
    return fetchAPI(`/api/orders/${orderNumber}/`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },

  patch: async (orderNumber, orderData) => {
    return fetchAPI(`/api/orders/${orderNumber}/`, {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  },

  delete: async (orderNumber) => {
    return fetchAPI(`/api/orders/${orderNumber}/`, {
      method: 'DELETE',
    });
  },

  getInvoice: async (orderNumber) => {
    return fetchAPI(`/api/orders/${orderNumber}/invoice/`, {
      method: 'GET',
    });
  },

  validateCoupon: async (couponCode) => {
    return fetchAPI('/api/orders/validate-coupon/', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode }),
    });
  },
};

export const reviewAPI = {
  getProductReviews: async (slug) => {
    const data = await fetchAPI(`/api/products/${slug}/reviews/`);
    return data.results || data || [];
  },

  createReview: async (reviewData) => {
    return fetchAPI('/api/products/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getMyReviews: async () => {
    const data = await fetchAPI('/api/products/reviews/my_reviews/');
    return data.results || data || [];
  },

  updateReview: async (id, reviewData) => {
    return fetchAPI(`/api/products/reviews/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (id) => {
    return fetchAPI(`/api/products/reviews/${id}/`, {
      method: 'DELETE',
    });
  },

  getAll: async () => {
    const data = await fetchAPI('/api/products/reviews/');
    return data.results || data || [];
  },

  getById: async (id) => {
    return fetchAPI(`/api/products/reviews/${id}/`);
  },
};

export const brandAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const endpoint = `/api/products/brands/${queryString ? `?${queryString}` : ''}`;
    const data = await fetchAPI(endpoint);
    return data.results || data || [];
  },

  getBySlug: async (slug) => {
    return fetchAPI(`/api/products/brands/${slug}/`);
  },

  create: async (brandData) => {
    return fetchAPI('/api/products/brands/', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  },

  update: async (slug, brandData) => {
    return fetchAPI(`/api/products/brands/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  },

  patch: async (slug, brandData) => {
    return fetchAPI(`/api/products/brands/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(brandData),
    });
  },

  delete: async (slug) => {
    return fetchAPI(`/api/products/brands/${slug}/`, {
      method: 'DELETE',
    });
  },
};

export const materialAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    const endpoint = `/api/products/materials/${queryString ? `?${queryString}` : ''}`;
    const data = await fetchAPI(endpoint);
    return data.results || data || [];
  },

  getById: async (id) => {
    return fetchAPI(`/api/products/materials/${id}/`);
  },
};

export const API_URL = API_BASE_URL;
export const getAllProducts = productAPI.getAll;
export const getProductBySlug = productAPI.getBySlug;
export const getAllCategories = categoryAPI.getAll;