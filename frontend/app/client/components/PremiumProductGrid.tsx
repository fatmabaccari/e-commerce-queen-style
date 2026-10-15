'use client';

import Image from 'next/image';
import Link from 'next/link';

/* ---------------- TYPES ---------------- */
export interface ProductVariantImage {
  image_url: string;
}

export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  product_variant_images?: ProductVariantImage[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  product_reference: string;
  product_variants?: ProductVariant[];
}

interface Props {
  products: Product[];
  loading: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/* ---------------- COMPONENT ---------------- */
export default function PremiumProductGrid({ products, loading }: Props) {
  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[420px] bg-gray-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* ---------- EMPTY ---------- */
  if (!products.length) {
    return (
      <p className="text-center text-gray-500 text-lg py-24">
        Aucun produit trouvé
      </p>
    );
  }

  /* ---------- GRID ---------- */
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {products.map((product) => {
        const variant = product.product_variants?.[0];
        const image = variant?.product_variant_images?.[0]?.image_url;

        const currentPrice = variant?.price ?? product.base_price;
        const oldPrice =
          product.base_price > currentPrice ? product.base_price : null;

        const stock =
          product.product_variants?.reduce(
            (sum, v) => sum + v.stock_quantity,
            0
          ) ?? 0;

        return (
          <article
            key={product.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            {/* ---------- IMAGE ---------- */}
            <div className="relative h-[360px] overflow-hidden rounded-t-2xl">
              <Image
                src={image ? `${BASE_URL}/uploads/${image}` : '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* STOCK BADGE */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                  stock > 0
                    ? 'bg-green-100/90 text-green-800'
                    : 'bg-red-100/90 text-red-800'
                }`}
              >
                {stock > 0 ? `${stock} en stock` : 'Rupture'}
              </span>

              {/* PROMO BADGE */}
              {oldPrice && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-black text-white">
                  Promo
                </span>
              )}
            </div>

            {/* ---------- CONTENT ---------- */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {product.description}
                </p>
              )}

              {/* ---------- PRICE ---------- */}
              <div className="flex justify-between items-end">
                <div>
                  {oldPrice && (
                    <span className="block text-sm text-gray-400 line-through">
                      {oldPrice.toFixed(2)} TND
                    </span>
                  )}
                  <span className="text-2xl font-extrabold text-gray-900">
                    {currentPrice.toFixed(2)} TND
                  </span>
                </div>

                <Link
                  href={`/products/${product.id}`}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Voir
                </Link>
              </div>
            </div>
            
          </article>
          
        );
      })}
    </div>
    
  );
}
