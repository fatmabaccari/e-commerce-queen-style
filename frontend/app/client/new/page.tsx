'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
}

interface ProductVariantImage {
  id: number;
  variant_id: number;
  image_url: string;
}

interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  product_variant_images: ProductVariantImage[];
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  product_reference: string;
  categories?: Category;
  product_variants: ProductVariant[];
}

interface Filters {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'newest';
  inStock: boolean;
}

const ProductShowcase: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    inStock: false,
  });

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setBaseUrl(isDev ? 'http://localhost:3000' : window.location.origin);
    
    fetchAllProducts();
    fetchCategories();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ limit: 100 });
      if (res.success) setAllProducts(res.data || []);
    } catch (err) {
      console.error('Erreur produits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error('Erreur catégories:', err);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      inStock: false,
    });
    setCurrentPage(1);
  };

  /* ---------- FILTER & SORT ---------- */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (filters.category !== 'all') {
      result = result.filter(p => p.categories?.id.toString() === filters.category);
    }

    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      result = result.filter(p => (p.product_variants[0]?.price || p.base_price) >= min);
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter(p => (p.product_variants[0]?.price || p.base_price) <= max);
    }

    if (filters.inStock) {
      result = result.filter(p =>
        (p.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0) > 0
      );
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a,b) => (a.product_variants[0]?.price||a.base_price) - (b.product_variants[0]?.price||b.base_price));
        break;
      case 'price_desc':
        result.sort((a,b) => (b.product_variants[0]?.price||b.base_price) - (a.product_variants[0]?.price||a.base_price));
        break;
      case 'name_asc':
        result.sort((a,b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a,b) => b.id - a.id);
        break;
    }

    return result;
  }, [allProducts, filters]);

  const displayedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getProductImage = (product: Product, variantIndex = 0) => {
    const img = product.product_variants[variantIndex]?.product_variant_images[0]?.image_url;
    return img ? `${baseUrl}/uploads/${img}` : `https://placehold.co/300x300/FFD700/000000?text=${encodeURIComponent(product.name)}`;
  };

  const getProductPrice = (product: Product) => product.product_variants[0]?.price || product.base_price;
  const getOldPrice = (product: Product) => {
    const price = getProductPrice(product);
    return product.base_price > price ? product.base_price : null;
  };

  const getStockQuantity = (product: Product) => product.product_variants?.reduce((sum,v)=>sum+v.stock_quantity,0) || 0;

  const handlePageChange = (page: number) => setCurrentPage(page);

  /* ---------- RENDER ---------- */
  if (loading) {
    return <p className="text-center py-12">Chargement...</p>;
  }

  return (
    <section className="py-12 px-4 md:px-12 bg-gray-50">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">

        {/* FILTERS */}
        <aside className="lg:w-1/4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>

          {/* Catégorie */}
          <select
            value={filters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
            className="w-full mb-4 border px-3 py-2 rounded-md"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Prix */}
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)}
              className="w-1/2 border px-2 py-1 rounded-md"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={e => handleFilterChange('maxPrice', e.target.value)}
              className="w-1/2 border px-2 py-1 rounded-md"
            />
          </div>

          {/* Stock */}
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={e => handleFilterChange('inStock', e.target.checked)}
            />
            En stock uniquement
          </label>

          <button
            onClick={resetFilters}
            className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-black transition"
          >
            Réinitialiser
          </button>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProducts.map(product => {
            const price = getProductPrice(product);
            const oldPrice = getOldPrice(product);
            const stock = getStockQuantity(product);
            const img = getProductImage(product);

            return (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition relative">
                <div className="relative h-60">
                  <img src={img} alt={product.name} className="w-full h-full object-cover rounded-t-lg" />
                  {stock <= 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                      Rupture
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {oldPrice && (
                      <span className="text-red-600 text-sm line-through">{oldPrice.toFixed(2)} TND</span>
                    )}
                    <span className="text-lg font-bold">{price.toFixed(2)} TND</span>
                  </div>
                  <Link
                    href={`/client/products/${product.id}`}
                    className="text-sm text-gray-700 hover:text-black"
                  >
                    Voir →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i+1)}
              className={`px-3 py-1 rounded-md ${currentPage === i+1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {i+1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductShowcase;
