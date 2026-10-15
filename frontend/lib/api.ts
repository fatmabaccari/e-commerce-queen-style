import axios from 'axios';
import Cookies from 'js-cookie';

// Get API URL and ensure it has a protocol
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// If the URL doesn't start with http:// or https://, add https://
if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
  API_URL = `https://${API_URL}`;
}

// Remove trailing slash if present
API_URL = API_URL.replace(/\/$/, '');

const API_VERSION = '/api/v1';

const api = axios.create({
  baseURL: `${API_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('adminToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Contacts API
export const contactsAPI = {
  getAll: async () => {
    const response = await api.get('/contacts');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    instagram?: string;
    facebook?: string;
  }) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<{
      name: string;
      phone: string;
      email: string;
      address: string;
      instagram?: string;
      facebook?: string;
    }>
  ) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

// Hero Slides API
export const heroSlidesAPI = {
  getAll: async () => {
    const response = await api.get('/hero-slides');
    return response.data;
  },

  updateText: async (id: number, data: { title: string; subtitle: string; order: number }) => {
    const response = await api.put(`/hero-slides/${id}/text`, data);

    return response.data;
  },

  updateImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put(`/hero-slides/${id}/image`, formData);

    return response.data;
  },
};
// Hero Section API
export const heroSectionAPI = {
  /* ===========================
     GET
  ============================ */

  // Récupérer toutes les sections hero (admin)
  getAll: async () => {
    const response = await api.get('/hero-sections');
    return response.data;
  },

  // Récupérer la section hero active (public)
  getActive: async () => {
    const response = await api.get('/hero-sections/active');
    return response.data;
  },

  /* ===========================
     CREATE
  ============================ */

  // Créer une nouvelle section hero (image principale optionnelle)
  create: async (data: {
    titleLine1: string;
    titleHighlight?: string;
    titleLine2?: string;
    subtitle?: string;
    ctaText?: string;
    collectionYear?: string;
    badgeText?: string;
    isActive?: boolean;
    order?: number;
    galleryImages?: {
      url: string;
      alt?: string;
      label?: string;
      order?: number;
    }[];
  }) => {
    const response = await api.post('/hero-sections', data);
    return response.data;
  },

  /* ===========================
     UPDATE TEXT ONLY
  ============================ */

  // Mettre à jour uniquement le texte
  updateText: async (
    id: string,
    data: Partial<{
      titleLine1: string;
      titleHighlight: string;
      titleLine2: string;
      subtitle: string;
      ctaText: string;
      collectionYear: string;
      badgeText: string;
      isActive: boolean;
      order: number;
    }>
  ) => {
    const response = await api.put(`/hero-sections/${id}/text`, data);
    return response.data;
  },

  /* ===========================
     UPDATE IMAGES
  ============================ */

  // Mettre à jour l’image principale
  updateMainImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put(
      `/hero-sections/${id}/main-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  // Mettre à jour une image de la galerie
  updateGalleryImage: async (imageId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put(
      `/hero-sections/gallery/${imageId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /* ===========================
     TOGGLE ACTIVE
  ============================ */

  // Activer / désactiver une section hero
  toggleActive: async (id: string) => {
    const response = await api.patch(
      `/hero-sections/${id}/toggle-active`
    );
    return response.data;
  },
};


// Hero Images API
export const heroImagesAPI = {
  // Récupérer toutes les images
  getAll: async (params?: { type?: 'MAIN' | 'GALLERY' }) => {
    const response = await api.get('/hero-images', { params });
    return response.data;
  },

  // Récupérer par ID
  getById: async (id: string) => {
    const response = await api.get(`/hero-images/${id}`);
    return response.data;
  },

  // Upload une nouvelle image
  upload: async (file: File, data: {
    type: 'MAIN' | 'GALLERY';
    alt?: string;
    label?: string;
    order?: number;
  }) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', data.type);
    if (data.alt) formData.append('alt', data.alt);
    if (data.label) formData.append('label', data.label);
    if (data.order) formData.append('order', data.order.toString());

    const token = Cookies.get('adminToken');
    const uploadApi = axios.create({
      baseURL: `${API_URL}${API_VERSION}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    const response = await uploadApi.post('/hero-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour une image
  update: async (id: string, data: {
    alt?: string;
    label?: string;
    order?: number;
    type?: 'MAIN' | 'GALLERY';
  }) => {
    const response = await api.put(`/hero-images/${id}`, data);
    return response.data;
  },

  // Supprimer une image
  delete: async (id: string) => {
    const response = await api.delete(`/hero-images/${id}`);
    return response.data;
  },
};

// Media API (pour gérer les médias uploadés)
export const mediaAPI = {
  getAll: async (params?: { folder?: string; resourceType?: 'image' | 'video' }) => {
    const response = await api.get('/media', { params });
    return response.data;
  },

  upload: async (file: File, folder: string = 'hero-section') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = Cookies.get('adminToken');
    const uploadApi = axios.create({
      baseURL: `${API_URL}${API_VERSION}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    const response = await uploadApi.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    const response = await api.post('/auth/sign-in', { email, password });
    return response.data;
  },
  signOut: async () => {
    const response = await api.post('/auth/sign-out');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category_id?: number }) => {
    const response = await api.get('/products', { params });
    console.log('Products API getAll response:', response.data);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data: { product_reference: string; name: string; description?: string; base_price: number; category_id?: number }) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; description?: string; base_price: number; category_id?: number }>) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
    
  },
  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string; parent_id?: number }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; description?: string; parent_id?: number }>) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Product Variants API
export const variantsAPI = {
  getAll: async (params?: { product_id?: number }) => {
    const response = await api.get('/product-variants', { params });
    console.log('Variants API getAll response:', response.data);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/product-variants/${id}`);
    return response.data;
  },
  create: async (data: { product_id: number; size: string; color: string; price: number; stock_quantity: number }) => {
    const response = await api.post('/product-variants', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ size: string; color: string; price: number; stock_quantity: number }>) => {
    const response = await api.put(`/product-variants/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/product-variants/${id}`);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { status?: string; user_id?: number; page?: number; limit?: number }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateStatus: async (id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  create: async (orderData: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
    email?: string;
    // Correction: utiliser les valeurs attendues par le backend
    payment_method: 'cash_on_delivery' | 'card';
    items?: Array<{
      variant_id: number;
      quantity: number;
    }>;
  }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
};

// Discounts API
export const discountsAPI = {
  getAll: async (params?: { active_only?: boolean }) => {
    const response = await api.get('/discounts', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  },
  create: async (data: { name: string; type: 'percentage' | 'fixed'; value: number; start_date: string; end_date: string; category_ids?: number[]; product_ids?: number[] }) => {
    const response = await api.post('/discounts', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{ name: string; type: 'percentage' | 'fixed'; value: number; start_date: string; end_date: string; category_ids?: number[]; product_ids?: number[] }>) => {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
  },
};

// Stock Movements API
export const stockMovementsAPI = {
  getAll: async () => {
    const response = await api.get('/stock-movements');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/stock-movements/${id}`);
    return response.data;
  },
  create: async (data: { variant_id: number; change_amount: number; reason: string }) => {
    const response = await api.post('/stock-movements', data);
    return response.data;
  },
};

// Product Variant Images API
export const variantImagesAPI = {
  getByVariantId: async (variantId: number) => {
    const response = await api.get(`/product-variants/${variantId}/images`);
    return response.data;
  },
  uploadSingle: async (variantId: number, file: File, sortOrder?: number) => {
    const formData = new FormData();
    formData.append('image', file);
    if (sortOrder !== undefined) {
      formData.append('sort_order', sortOrder.toString());
    }
    // Create a new axios instance for file uploads without the default JSON content-type
    const token = Cookies.get('adminToken');
    const uploadApi = axios.create({
      baseURL: `${API_URL}${API_VERSION}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const response = await uploadApi.post(`/product-variants/${variantId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadMultiple: async (variantId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    // Create a new axios instance for file uploads without the default JSON content-type
    const token = Cookies.get('adminToken');
    const uploadApi = axios.create({
      baseURL: `${API_URL}${API_VERSION}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    const response = await uploadApi.post(`/product-variants/${variantId}/images/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (imageId: number) => {
    const response = await api.delete(`/product-variants/images/${imageId}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: number, data: { first_name?: string; last_name?: string; phone?: string | null }) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

