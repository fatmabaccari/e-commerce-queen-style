'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { discountsAPI, categoriesAPI, productsAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  product_reference: string;
}

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = Number(params.id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    start_date: '',
    end_date: '',
    category_ids: [] as number[],
    product_ids: [] as number[],
  });

  useEffect(() => {
    fetchDiscount();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchDiscount = async () => {
    try {
      const response = await discountsAPI.getById(discountId);
      const discount = response.data;
      const startDate = new Date(discount.start_date);
      const endDate = new Date(discount.end_date);
      
      // Extract category and product IDs from relationships
      const categoryIds = discount.categories?.map((dc: any) => dc.category_id || dc.category?.id) || [];
      const productIds = discount.products?.map((dp: any) => dp.product_id || dp.product?.id) || [];
      
      setFormData({
        name: discount.name || '',
        type: discount.type || 'percentage',
        value: discount.value?.toString() || '',
        start_date: startDate.toISOString().slice(0, 16),
        end_date: endDate.toISOString().slice(0, 16),
        category_ids: categoryIds,
        product_ids: productIds,
      });
    } catch (error) {
      console.error('Error fetching discount:', error);
      router.push('/dashboard/discounts');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that at least one category or product is selected
      if (formData.category_ids.length === 0 && formData.product_ids.length === 0) {
        setErrorMessage('Please select at least one category or product to apply the discount to');
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      await discountsAPI.update(discountId, {
        name: formData.name,
        type: formData.type,
        value: parseFloat(formData.value), // Convert string to number
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        category_ids: formData.category_ids.length > 0 ? formData.category_ids : [],
        product_ids: formData.product_ids.length > 0 ? formData.product_ids : [],
      });
      router.push('/dashboard/discounts');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'Failed to update discount');
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard/discounts"
          className="mr-4 text-gray-600 hover:text-yellow-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Discount</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Discount Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Discount Type *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Value * {formData.type === 'percentage' && '(0-100)'}
            </label>
            <input
              id="value"
              type="number"
              step="0.01"
              min={formData.type === 'percentage' ? 0 : 0}
              max={formData.type === 'percentage' ? 100 : undefined}
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                id="start_date"
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                id="end_date"
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply to Categories *
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available</p>
              ) : (
                categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            category_ids: [...formData.category_ids, category.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            category_ids: formData.category_ids.filter((id) => id !== category.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select categories to apply this discount to all products in those categories
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply to Products *
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">No products available</p>
              ) : (
                products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.product_ids.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            product_ids: [...formData.product_ids, product.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            product_ids: formData.product_ids.filter((id) => id !== product.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-400"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <span className="text-xs text-gray-500 ml-2 font-mono">({product.product_reference})</span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Select specific products to apply this discount to. You can select both categories and products.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Updating...' : 'Update Discount'}
            </button>
            <Link
              href="/dashboard/discounts"
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

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

