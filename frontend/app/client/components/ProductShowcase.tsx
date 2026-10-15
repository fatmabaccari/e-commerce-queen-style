'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import { Crown } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  category_id: number | null;
  product_reference: string;
  categories?: {
    id: number;
    name: string;
    description: string;
    parent_id: number | null;
  };
  product_variants: Array<{
    id: number;
    product_id: number;
    size: string;
    color: string;
    price: number;
    stock_quantity: number;
    product_variant_images: Array<{
      id: number;
      variant_id: number;
      image_url: string;
      sort_order: number | null;
    }>;
  }>;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ProductShowcase: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    setBaseUrl(isDev ? 'http://localhost:3000' : window.location.origin);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response: ApiResponse = await productsAPI.getAll({ limit: 6 });
        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else setProducts([]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getProductImage = (product: Product, variantIndex: number = 0) => {
    const variant = product.product_variants?.[variantIndex];
    const imageUrl = variant?.product_variant_images?.[0]?.image_url;
    return imageUrl ? `${baseUrl}/uploads/${imageUrl}` : `https://placehold.co/400x400/FFD700/000000?text=${encodeURIComponent(product.name)}`;
  };

  const getHoverImage = (product: Product) => {
    const firstVariant = product.product_variants?.[0];
    const secondImage = firstVariant?.product_variant_images?.[1]?.image_url;
    if (secondImage) return `${baseUrl}/uploads/${secondImage}`;
    const secondVariant = product.product_variants?.[1];
    const secondVariantImage = secondVariant?.product_variant_images?.[0]?.image_url;
    return secondVariantImage ? `${baseUrl}/uploads/${secondVariantImage}` : null;
  };

  const getProductPrice = (product: Product) => product.product_variants?.[0]?.price ?? product.base_price;
  const getStockQuantity = (product: Product) => product.product_variants?.reduce((total, v) => total + v.stock_quantity, 0) ?? 0;

  if (loading) return <div className="h-96 flex items-center justify-center">Chargement...</div>;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const mainImage = getProductImage(product);
          const hoverImage = getHoverImage(product);
          const productPrice = getProductPrice(product);
          const stockQuantity = getStockQuantity(product);
          const firstVariant = product.product_variants?.[0];

          return (
            <div
              key={product.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-transform duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Images produit */}
              <div className="relative h-[450px] overflow-hidden rounded-3xl">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {hoverImage && (
                  <img
                    src={hoverImage}
                    alt={`${product.name} hover`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                )}
                {/* Overlay luxe */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge Ref avec icône couronne */}
                <div className="absolute top-4 left-4 flex items-center gap-1">
                  <Crown size={16} className="text-yellow-400" />
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 shadow-sm truncate max-w-[120px]">
                    Ref: {product.product_reference}
                  </span>
                </div>

                {/* Stock */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm truncate max-w-[120px] block ${
                    stockQuantity > 10
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : stockQuantity > 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {stockQuantity > 0 ? `${stockQuantity} en stock` : 'Rupture'}
                  </span>
                </div>

                {/* Variants */}
                {firstVariant && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">{firstVariant.color}</span>
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">Taille: {firstVariant.size}</span>
                  </div>
                )}
              </div>

              {/* Contenu produit */}
              <div className="p-6">
                {product.categories && (
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full mb-3">
                    {product.categories.name}
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{product.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{productPrice.toFixed(2)} TND</span>
                    {product.base_price > productPrice && (
                      <span className="text-sm text-gray-500 ml-2 line-through">{product.base_price.toFixed(2)} TND</span>
                    )}
                  </div>
<Link
  href={`/client/products/${product.id}`}
  className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium hover:shadow-lg"
>
  Voir détails
</Link>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voir plus */}
      <div className="text-center mt-12">
        <Link
          href="/client/new"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 group shadow-lg"
        >
          <span>Découvrir notre collection</span>
          <svg
            className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <p className="mt-4 text-gray-500 text-sm">Découvrez nos produits dans notre catalogue</p>
      </div>
    </section>
  );
};

export default ProductShowcase;
