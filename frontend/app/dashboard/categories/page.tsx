'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { categoriesAPI } from '@/lib/api';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  categories?: Category | null; // Parent category
}

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setShowDeleteModal(false);
    try {
      await categoriesAPI.delete(pendingDeleteId);
      fetchCategories();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la suppression de la catégorie');
      setShowErrorModal(true);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  // Build a map of all categories by ID for efficient lookup
  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach(cat => map.set(cat.id, cat));
    return map;
  }, [categories]);

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

    // Sort tree: parents first, then children (alphabetically)
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

  // Flatten tree for display (respecting expanded state)
  // Root categories (level 0) are always shown, children only when parent is expanded
  const flattenedCategories = useMemo(() => {
    const result: CategoryNode[] = [];
    
    const traverse = (nodes: CategoryNode[], level: number = 0) => {
      nodes.forEach(node => {
        result.push({ ...node, level });
        // Show children if parent is expanded (or if it's root level)
        if (expandedCategories.has(node.id)) {
          traverse(node.children, level + 1);
        }
      });
    };

    traverse(categoryTree);
    return result;
  }, [categoryTree, expandedCategories]);

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Build breadcrumb path for a category (parent > child > grandchild)
  const getCategoryPath = (category: Category): string[] => {
    const path: string[] = [category.name];
    let currentId: number | null = category.parent_id;

    // Traverse up the parent chain using the category map
    const visited = new Set<number>(); // Prevent circular references
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const parent = categoryMap.get(currentId);
      if (parent) {
        path.unshift(parent.name);
        currentId = parent.parent_id;
      } else {
        break;
      }
    }

    return path;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
        <Link
          href="/dashboard/categories/new"
          className="flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une catégorie
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des catégories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aucune catégorie trouvée</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom de la catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flattenedCategories.map((category) => {
                const hasChildren = category.children.length > 0;
                const isExpanded = expandedCategories.has(category.id);
                const indentLevel = category.level * 24; // 24px per level
                
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm" style={{ paddingLeft: `${indentLevel}px` }}>
                        {hasChildren ? (
                          <button
                            onClick={() => toggleExpand(category.id)}
                            className="p-1 rounded hover:bg-gray-200 transition-colors"
                            aria-label={isExpanded ? 'Réduire' : 'Développer'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6" /> // Spacer for alignment when no expand button
                        )}
                        <span
                          className={
                            category.level === 0
                              ? 'font-semibold text-gray-900'
                              : category.level === 1
                              ? 'font-medium text-gray-800'
                              : 'text-gray-700'
                          }
                        >
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/categories/${category.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Supprimer la catégorie</h2>
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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

