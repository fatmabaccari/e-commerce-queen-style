'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { variantImagesAPI, variantsAPI } from '@/lib/api';
import { ArrowLeft, Upload, Trash2, X } from 'lucide-react';

interface VariantImage {
  id: number;
  image_url: string;
  sort_order: number | null;
}

export default function VariantImagesPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const variantId = Number(params.variantId);
  const [variant, setVariant] = useState<{ id: number; size: string; color: string; products: { name: string } } | null>(null);
  const [images, setImages] = useState<VariantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVariant();
    fetchImages();
  }, []);

  const fetchVariant = async () => {
    try {
      const response = await variantsAPI.getById(variantId);
      setVariant(response.data);
    } catch (error) {
      console.error('Error fetching variant:', error);
      router.push(`/dashboard/products/${productId}/variants`);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await variantImagesAPI.getByVariantId(variantId);
      setImages(response.data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (multiple: boolean) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      if (multiple) {
        await variantImagesAPI.uploadMultiple(variantId, selectedFiles);
      } else {
        await variantImagesAPI.uploadSingle(variantId, selectedFiles[0]);
      }
      setSelectedFiles([]);
      setShowUploadForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchImages();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to upload images');
      setShowErrorModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (imageId: number) => {
    setPendingDeleteId(imageId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    setShowDeleteModal(false);
    try {
      await variantImagesAPI.delete(pendingDeleteId);
      fetchImages();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete image');
      setShowErrorModal(true);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  const getImageUrl = (imageUrl: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${apiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Variant Images</h1>
          <p className="text-gray-600 mt-1">
            {variant?.products.name} - {variant?.size} / {variant?.color}
          </p>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upload Images</h2>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFiles([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Images
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex space-x-4">
                <button
                  onClick={() => handleUpload(false)}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? 'Uploading...' : 'Upload First Image'}
                </button>
                {selectedFiles.length > 1 && (
                  <button
                    onClick={() => handleUpload(true)}
                    disabled={uploading}
                    className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {uploading ? 'Uploading...' : `Upload All (${selectedFiles.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!showUploadForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Images
          </button>
        </div>
      )}

      {/* Images Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Loading images...
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No images uploaded yet</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden group relative">
              <div className="aspect-square bg-gray-100">
                <img
                  src={getImageUrl(image.image_url)}
                  alt={`Variant image ${image.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Order: {image.sort_order || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Image</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this image? This action cannot be undone.
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

