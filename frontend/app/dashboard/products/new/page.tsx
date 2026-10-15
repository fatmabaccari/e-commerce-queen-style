'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    product_reference: '',
    name: '',
    description: '',
    base_price: '',
    category_id: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Build hierarchical tree structure
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate product reference format
      const refStr = formData.product_reference.trim();
      if (!/^\d{6}$/.test(refStr)) {
        setErrorMessage('La référence du produit doit contenir exactement 6 chiffres (ex. : 015441)');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      await productsAPI.create({
        product_reference: refStr,
        name: formData.name,
        description: formData.description || undefined,
        base_price: parseFloat(formData.base_price),
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
      });
      router.push('/dashboard/products');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'Échec de la création du produit');
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Link
          href="/dashboard/products"
          className="mr-4 text-gray-600 hover:text-yellow-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau produit</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="product_reference" className="block text-sm font-medium text-gray-700 mb-2">
              Référence produit * <span className="text-gray-500 text-xs">(6 chiffres, ex. : 015441)</span>
            </label>
            <input
              id="product_reference"
              type="text"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={formData.product_reference}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setFormData({ ...formData, product_reference: value });
              }}
              placeholder="015441"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
            />
            {formData.product_reference && formData.product_reference.length !== 6 && (
              <p className="mt-1 text-xs text-red-600">Doit contenir exactement 6 chiffres</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix de base * (DT)
              </label>
              <input
                id="base_price"
                type="number"
                step="0.01"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
              >
                <option value="">Sélectionner une catégorie</option>
                {flattenedCategoriesForDropdown.map(cat => {
                  // Create visual hierarchy with indentation
                  const indent = '  '.repeat(cat.level); // 2 spaces per level
                  const prefix = cat.level > 0 ? '└─ ' : '';
                  const displayName = `${indent}${prefix}${cat.name}`;
                  
                  return (
                    <option key={cat.id} value={cat.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Création...' : 'Créer le produit'}
            </button>
            <Link
              href="/dashboard/products"
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 text-center transition-colors font-medium"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>

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

