'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { variantsAPI, productsAPI } from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

interface Variant {
  id: number;
  size: string;
  color: string;
  price: number;
  effective_price?: number;
  stock_quantity: number;
  product: {
    id: number;
    name: string;
  };
}

export default function ProductVariantsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [product, setProduct] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/dashboard/products');
    }
  };

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await variantsAPI.getAll({ product_id: productId });
      setVariants(response.data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
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
      await variantsAPI.delete(pendingDeleteId);
      fetchVariants();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete variant');
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
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/products"
          className="mr-4 text-gray-600 hover:text-yellow-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Variants for {product?.name || 'Product'}
          </h1>
          <p className="text-gray-600 mt-1">Manage product variants and their images</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {variants.length} variant{variants.length !== 1 ? 's' : ''} found
        </div>
        <Link
          href={`/dashboard/products/${productId}/variants/new`}
          className="flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Variant
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading variants...</div>
        ) : variants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">No variants found for this product</p>
            <Link
              href={`/dashboard/products/${productId}/variants/new`}
              className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Variant
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{variant.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                        style={{ backgroundColor: variant.color.toLowerCase() }}
                        title={variant.color}
                      />
                      <span className="text-sm text-gray-900">{variant.color}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {variant.effective_price !== undefined && variant.effective_price !== variant.price ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 line-through">
                          ${variant.price.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          ${variant.effective_price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        ${variant.price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      variant.stock_quantity > 0 ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {variant.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/dashboard/products/${productId}/variants/${variant.id}/images`}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Manage Images"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/dashboard/products/${productId}/variants/${variant.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-700"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Variant</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this variant? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
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

