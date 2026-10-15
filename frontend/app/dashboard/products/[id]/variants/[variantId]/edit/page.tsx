'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { variantsAPI, productsAPI, variantImagesAPI } from '@/lib/api';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface VariantImage {
  id: number;
  image_url: string;
  sort_order: number | null;
}

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const variantId = Number(params.variantId);
  const [product, setProduct] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [existingImages, setExistingImages] = useState<VariantImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    price: '',
    stock_quantity: '',
  });

  useEffect(() => {
    fetchProduct();
    fetchVariant();
    fetchImages();
  }, []);

  useEffect(() => {
    // Cleanup object URLs when component unmounts or previews change
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchVariant = async () => {
    try {
      const response = await variantsAPI.getById(variantId);
      const variant = response.data;
      setFormData({
        size: variant.size || '',
        color: variant.color || '',
        price: variant.price?.toString() || '',
        stock_quantity: variant.stock_quantity?.toString() || '',
      });
    } catch (error) {
      console.error('Error fetching variant:', error);
      router.push(`/dashboard/products/${productId}/variants`);
    } finally {
      setFetching(false);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await variantImagesAPI.getByVariantId(variantId);
      setExistingImages(response.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      // Create previews
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    
    // Revoke object URLs to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    // Reset file input if no files left
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageUrl = (imageUrl: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${apiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the variant
      await variantsAPI.update(variantId, {
        size: formData.size,
        color: formData.color,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
      });

      // Upload new images if any were selected
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        try {
          if (selectedFiles.length === 1) {
            await variantImagesAPI.uploadSingle(variantId, selectedFiles[0]);
          } else {
            await variantImagesAPI.uploadMultiple(variantId, selectedFiles);
          }
        } catch (imageError: any) {
          console.error('Error uploading images:', imageError);
          setErrorMessage('Variante mise à jour mais échec du téléchargement des images : ' + (imageError.response?.data?.message || 'Erreur inconnue'));
          setShowErrorModal(true);
        } finally {
          setUploadingImages(false);
        }
      }

      router.push(`/dashboard/products/${productId}/variants`);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la mise à jour de la variante');
      setShowErrorModal(true);
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/dashboard/products/${productId}/variants`}
          className="mr-4 text-gray-600 hover:text-yellow-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la variante</h1>
          <p className="text-gray-600 mt-1">for {product?.name || 'Product'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
              Size *
            </label>
            <input
              id="size"
              type="text"
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <input
              id="color"
              type="text"
              required
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Prix * (DT)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              id="stock_quantity"
              type="number"
              min="0"
              required
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(image.image_url)}
                        alt={`Variant image ${image.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      Order: {image.sort_order || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href={`/dashboard/products/${productId}/variants/${variantId}/images`}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                Manage all images →
              </Link>
            </div>
          )}

          {/* Add New Images */}
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              Add New Images (Optional)
            </label>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {selectedFiles[index].name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {existingImages.length > 0 
                ? 'Add more images or manage all images from the images page.'
                : 'You can upload images now or add them later from the variant images page.'}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading || uploadingImages 
                ? (uploadingImages ? 'Uploading Images...' : 'Updating...') 
                : 'Mettre à jour la variante'}
              </button>
              <Link
                href={`/dashboard/products/${productId}/variants`}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 text-center transition-colors"
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

