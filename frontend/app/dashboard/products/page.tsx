'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Search, Package, ChevronDown, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

interface Variant {
  id: number;
  size: string;
  color: string;
  price: number;
  effective_price?: number;
  stock_quantity: number;
  product_variant_images?: { id: number; image_url: string }[];
}

interface Product {
  id: number;
  product_reference: string;
  name: string;
  description: string | null;
  base_price: number;
  effective_price?: number;
  category_id: number | null;
  category?: Category | null;
  created_at: string;
  product_variants?: Variant[];
  total_stock?: number;
  variant_count?: number;
  price_min?: number;
  price_max?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /* ----------------------------------
     Category lookup map (IMPORTANT)
  ---------------------------------- */
  const categoryMap = useMemo(() => {
    return Object.fromEntries(categories.map(cat => [cat.id, cat]));
  }, [categories]);

  // Build hierarchical tree structure for dropdown
  const categoryTree = useMemo(() => {
    const tree: CategoryNode[] = [];
    const nodeMap = new Map<number, CategoryNode>();

    // First pass: create all nodes
    categories.forEach(cat => {
      nodeMap.set(cat.id, {
        ...cat,
        children: [],
        level: 0,
      });
    });

    // Second pass: build tree structure
    categories.forEach(cat => {
      const node = nodeMap.get(cat.id)!;
      if (cat.parent_id && nodeMap.has(cat.parent_id)) {
        const parent = nodeMap.get(cat.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        tree.push(node);
      }
    });

    // Sort tree alphabetically
    const sortTree = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(node => ({
          ...node,
          children: sortTree(node.children),
        }));
    };

    return sortTree(tree);
  }, [categories]);

  // Flatten tree for dropdown display (all categories visible)
  const flattenedCategoriesForDropdown = useMemo(() => {
    const result: CategoryNode[] = [];
    
    const traverse = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        result.push(node);
        traverse(node.children);
      });
    };

    traverse(categoryTree);
    return result;
  }, [categoryTree]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length) {
      fetchProducts();
    }
  }, [page, search, selectedCategory, categories]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const response = await productsAPI.getAll(params);

      const rawProducts: any[] = response.data || [];

      const hydratedProducts: Product[] = rawProducts.map((p) => {
        const variants: Variant[] = p.product_variants || [];

        const totalStock = variants.reduce(
          (sum, v) => sum + (typeof v.stock_quantity === 'number' ? v.stock_quantity : 0),
          0
        );

        const variantCount = variants.length;

        const variantPrices = variants.map((v) =>
          typeof v.effective_price === 'number' ? v.effective_price : v.price
        );

        const baseOrEffective = typeof p.effective_price === 'number' ? p.effective_price : p.base_price;

        const priceMin = variantPrices.length
          ? Math.min(...variantPrices)
          : baseOrEffective;

        const priceMax = variantPrices.length
          ? Math.max(...variantPrices)
          : baseOrEffective;

        return {
          ...p,
          category: p.category_id ? categoryMap[p.category_id] || null : null,
          product_variants: variants,
          total_stock: totalStock,
          variant_count: variantCount,
          price_min: priceMin,
          price_max: priceMax,
        };
      });

      setProducts(hydratedProducts);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by size and color client-side
  const filteredProducts = useMemo(() => {
    let filtered = products;

    const hasSizeFilter = sizeFilter.trim();
    const hasColorFilter = colorFilter.trim();

    if (!hasSizeFilter && !hasColorFilter) {
      return filtered;
    }

    const sizeLower = hasSizeFilter ? sizeFilter.toLowerCase().trim() : '';
    const colorLower = hasColorFilter ? colorFilter.toLowerCase().trim() : '';

    // If both size and color are specified, find products with variants matching BOTH
    if (hasSizeFilter && hasColorFilter) {
      filtered = filtered.filter(product => {
        const variants = product.product_variants || [];
        return variants.some(variant => 
          variant.size.toLowerCase().includes(sizeLower) &&
          variant.color.toLowerCase().includes(colorLower)
        );
      });
    } else if (hasSizeFilter) {
      // Filter by size only
      filtered = filtered.filter(product => {
        const variants = product.product_variants || [];
        return variants.some(variant => 
          variant.size.toLowerCase().includes(sizeLower)
        );
      });
    } else if (hasColorFilter) {
      // Filter by color only
      filtered = filtered.filter(product => {
        const variants = product.product_variants || [];
        return variants.some(variant => 
          variant.color.toLowerCase().includes(colorLower)
        );
      });
    }

    return filtered;
  }, [products, sizeFilter, colorFilter]);

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setShowDeleteModal(false);
    try {
      await productsAPI.delete(pendingDeleteId);
      fetchProducts();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la suppression du produit');
      setShowErrorModal(true);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Produits</h1>
        <Link
          href="/dashboard/products/new"
          className="flex items-center justify-center sm:justify-start px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Ajouter un produit</span>
          <span className="sm:hidden">Ajouter</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : '');
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="">Toutes les catégories</option>
            {flattenedCategoriesForDropdown.map(cat => {
              // Create visual hierarchy with visible spacing and separators
              // Using dashes for indentation that will definitely be visible
              const indentChars = cat.level > 0 ? '─'.repeat(cat.level * 3) + ' ' : '';
              const displayName = cat.level === 0 
                ? cat.name 
                : `${indentChars}${cat.name}`;
              
              return (
                <option key={cat.id} value={cat.id}>
                  {displayName}
                </option>
              );
            })}
          </select>

          <input
            type="text"
            placeholder="Filtrer par taille..."
            value={sizeFilter}
            onChange={(e) => {
              setSizeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />

          <input
            type="text"
            placeholder="Filtrer par couleur..."
            value={colorFilter}
            onChange={(e) => {
              setColorFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />

          {(sizeFilter || colorFilter) && (
            <button
              onClick={() => {
                setSizeFilter('');
                setColorFilter('');
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Products & Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {products.length === 0 ? 'Aucun produit trouvé' : 'Aucun produit ne correspond aux filtres'}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10">
                      {/* Expand / collapse */}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Référence
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Catégorie
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Prix
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Créé
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const isExpanded = expandedProductId === product.id;
                    const variants = product.product_variants || [];

                    return (
                      <React.Fragment key={product.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 align-top">
                            {variants.length > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedProductId(isExpanded ? null : product.id)
                                }
                                className="p-1 rounded hover:bg-gray-200"
                                aria-label={isExpanded ? 'Réduire les variantes' : 'Développer les variantes'}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            ) : (
                              <Link
                                href={`/dashboard/products/${product.id}/variants/new`}
                                className="p-1 rounded hover:bg-yellow-50 inline-flex items-center justify-center"
                                title="Ajouter la première variante"
                              >
                                <Plus className="w-4 h-4 text-yellow-600 hover:text-yellow-700" />
                              </Link>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 font-mono align-top text-sm">
                            {product.product_reference || 'N/A'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 align-top">
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 align-top text-sm">
                            {product.category?.name || 'Sans catégorie'}
                          </td>
                          <td className="px-4 lg:px-6 py-4 align-top text-sm text-gray-700">
                            <div className="flex flex-col gap-1">
                              <span>
                                <span className="font-medium">
                                  {product.total_stock ?? 0}
                                </span>{' '}
                                unités
                              </span>
                              <span className="text-xs text-gray-500">
                                {product.variant_count || 0} variante
                                {product.variant_count === 1 ? '' : 's'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 align-top">
                            {product.effective_price !== undefined &&
                            product.effective_price !== product.base_price ? (
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(product.base_price)}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  {formatCurrency(product.effective_price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm">{formatCurrency(product.base_price)}</span>
                            )}
                            {typeof product.price_min === 'number' &&
                              typeof product.price_max === 'number' &&
                              (product.price_min !== product.price_max) && (
                                <div className="mt-1 text-xs text-gray-500">
                                  Variantes : {formatCurrency(product.price_min)} - {formatCurrency(product.price_max)}
                                </div>
                              )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 align-top">
                            {new Date(product.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right align-top">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/products/${product.id}/edit`}>
                                <Edit className="w-5 h-5 text-yellow-600 hover:text-yellow-700" />
                              </Link>
                              <button onClick={() => handleDelete(product.id)}>
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="px-4 lg:px-6 pb-6 pt-4 bg-gray-50">
                              <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                      Variantes pour {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {variants.length} variante{variants.length === 1 ? '' : 's'} au total
                                    </p>
                                  </div>
                                  <Link
                                    href={`/dashboard/products/${product.id}/variants/new`}
                                    className="inline-flex items-center justify-center sm:justify-start px-4 py-2 text-sm bg-black text-yellow-400 rounded-lg hover:bg-gray-900 font-medium transition-colors"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter une variante
                                  </Link>
                                </div>
                                {variants.length === 0 ? (
                                  <div className="px-4 sm:px-6 py-12 text-center">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 mb-4">Aucune variante pour ce produit pour le moment.</p>
                                    <Link
                                      href={`/dashboard/products/${product.id}/variants/new`}
                                      className="inline-flex items-center px-4 py-2 text-sm bg-black text-yellow-400 rounded-lg hover:bg-gray-900 font-medium transition-colors"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Créer la première variante
                                    </Link>
                                  </div>
                                ) : (
                                  <div className="px-4 sm:px-6 py-4 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Référence
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Taille
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Couleur
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Prix
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                          </th>
                                          <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {variants.map((variant) => {
                                      const imageCount = variant.product_variant_images?.length || 0;
                                      const firstImage = variant.product_variant_images?.[0]?.image_url;
                                      
                                      const getImageUrl = (imageUrl: string | undefined) => {
                                        if (!imageUrl) return '';
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';
                                        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                                          return imageUrl;
                                        }
                                        if (imageUrl.startsWith('/uploads/')) {
                                          return `${apiUrl}${imageUrl}`;
                                        }
                                        if (imageUrl.startsWith('uploads/')) {
                                          return `${apiUrl}/${imageUrl}`;
                                        }
                                        return `${apiUrl}/uploads/${imageUrl}`;
                                      };
                                      
                                      const imageUrl = firstImage ? getImageUrl(firstImage) : '';
                                      
                                      return (
                                        <tr key={variant.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-4 whitespace-nowrap">
                                            {imageUrl ? (
                                              <button
                                                onClick={() => setSelectedImage(imageUrl)}
                                                className="flex items-center justify-center w-10 h-10 rounded border border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                                                title="View image"
                                              >
                                                <ImageIcon className="w-5 h-5 text-yellow-600" />
                                              </button>
                                            ) : (
                                              <div className="flex items-center justify-center w-10 h-10 rounded border border-gray-200 bg-gray-50">
                                                <Package className="w-4 h-4 text-gray-300" />
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-gray-900">
                                              {product.product_reference || 'N/A'}
                                            </div>
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{variant.size}</div>
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <div
                                                className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                                                style={{ backgroundColor: variant.color.toLowerCase() }}
                                                title={variant.color}
                                              />
                                              <span className="text-sm text-gray-900">{variant.color}</span>
                                            </div>
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            {variant.effective_price !== undefined && variant.effective_price !== variant.price ? (
                                              <div className="flex flex-col">
                                                <span className="text-sm text-gray-500 line-through">
                                                  {formatCurrency(variant.price)}
                                                </span>
                                                <span className="text-sm font-semibold text-green-600">
                                                  {formatCurrency(variant.effective_price)}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(variant.price)}
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${
                                              variant.stock_quantity > 0 ? 'text-gray-900' : 'text-red-600'
                                            }`}>
                                              {variant.stock_quantity}
                                            </span>
                                          </td>
                                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                              <Link
                                                href={`/dashboard/products/${product.id}/variants/${variant.id}/images`}
                                                className="text-yellow-600 hover:text-yellow-700"
                                                title="Gérer les images"
                                              >
                                                <ImageIcon className="w-5 h-5" />
                                              </Link>
                                              <Link
                                                href={`/dashboard/products/${product.id}/variants/${variant.id}/edit`}
                                                className="text-yellow-600 hover:text-yellow-700"
                                                title="Modifier"
                                              >
                                                <Edit className="w-5 h-5" />
                                              </Link>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const isExpanded = expandedProductId === product.id;
                const variants = product.product_variants || [];

                return (
                  <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {variants.length > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedProductId(isExpanded ? null : product.id)
                              }
                              className="p-1 rounded hover:bg-gray-200"
                              aria-label={isExpanded ? 'Réduire les variantes' : 'Développer les variantes'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          ) : (
                            <Link
                              href={`/dashboard/products/${product.id}/variants/new`}
                              className="p-1 rounded hover:bg-yellow-50"
                              title="Ajouter la première variante"
                            >
                              <Plus className="w-4 h-4 text-yellow-600" />
                            </Link>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs font-mono text-gray-500 mt-1">
                              {product.product_reference || 'N/A'}
                            </div>
                          </div>
                        </div>
                        {product.description && (
                          <div className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {product.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="w-5 h-5 text-yellow-600 hover:text-yellow-700" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Catégorie</div>
                        <div className="text-gray-900">{product.category?.name || 'Sans catégorie'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Stock</div>
                        <div className="text-gray-900">
                          <span className="font-medium">{product.total_stock ?? 0}</span> unités
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.variant_count || 0} variante{product.variant_count === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs text-gray-500 mb-1">Prix</div>
                      {product.effective_price !== undefined &&
                      product.effective_price !== product.base_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(product.base_price)}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(product.effective_price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.base_price)}
                        </span>
                      )}
                      {typeof product.price_min === 'number' &&
                        typeof product.price_max === 'number' &&
                        (product.price_min !== product.price_max) && (
                          <div className="text-xs text-gray-500 mt-1">
                            Variantes : {formatCurrency(product.price_min)} - {formatCurrency(product.price_max)}
                          </div>
                        )}
                    </div>

                    {isExpanded && variants.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Variantes ({variants.length})
                          </h4>
                          <Link
                            href={`/dashboard/products/${product.id}/variants/new`}
                            className="text-xs text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Ajouter
                          </Link>
                        </div>
                        <div className="space-y-2">
                          {variants.map((variant) => {
                            const firstImage = variant.product_variant_images?.[0]?.image_url;
                            const getImageUrl = (imageUrl: string | undefined) => {
                              if (!imageUrl) return '';
                              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';
                              if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                                return imageUrl;
                              }
                              if (imageUrl.startsWith('/uploads/')) {
                                return `${apiUrl}${imageUrl}`;
                              }
                              if (imageUrl.startsWith('uploads/')) {
                                return `${apiUrl}/${imageUrl}`;
                              }
                              return `${apiUrl}/uploads/${imageUrl}`;
                            };
                            const imageUrl = firstImage ? getImageUrl(firstImage) : '';

                            return (
                              <div key={variant.id} className="bg-gray-50 rounded p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  {imageUrl ? (
                                    <button
                                      onClick={() => setSelectedImage(imageUrl)}
                                      className="w-10 h-10 rounded border border-gray-300 hover:border-yellow-400 flex items-center justify-center"
                                    >
                                      <ImageIcon className="w-4 h-4 text-yellow-600" />
                                    </button>
                                  ) : (
                                    <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center">
                                      <Package className="w-4 h-4 text-gray-300" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: variant.color.toLowerCase() }}
                                      />
                                      <span className="text-sm font-medium text-gray-900">{variant.size}</span>
                                      <span className="text-xs text-gray-500">/</span>
                                      <span className="text-sm text-gray-700">{variant.color}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {variant.effective_price !== undefined && variant.effective_price !== variant.price ? (
                                        <span>
                                          <span className="line-through">{formatCurrency(variant.price)}</span>{' '}
                                          <span className="text-green-600 font-semibold">{formatCurrency(variant.effective_price)}</span>
                                        </span>
                                      ) : (
                                        formatCurrency(variant.price)
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-medium ${
                                      variant.stock_quantity > 0 ? 'text-gray-900' : 'text-red-600'
                                    }`}>
                                      {variant.stock_quantity}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Link
                                        href={`/dashboard/products/${product.id}/variants/${variant.id}/images`}
                                        className="text-yellow-600"
                                        title="Images"
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                      </Link>
                                      <Link
                                        href={`/dashboard/products/${product.id}/variants/${variant.id}/edit`}
                                        className="text-yellow-600"
                                        title="Modifier"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full size variant image"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Supprimer le produit</h2>
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible et supprimera également toutes les variantes associées.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Erreur</h2>
              <p className="text-gray-700 mb-6">{errorMessage}</p>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
