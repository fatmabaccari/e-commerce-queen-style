'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { productsAPI, ordersAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiArrowLeft, FiPackage, FiTruck, FiCreditCard, FiStar } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

interface ProductVariantImage {
    id: number;
    variant_id: number;
    image_url: string;
}

interface ProductVariant {
    id: number;
    color: string;
    size: string;
    price: number;
    stock_quantity: number;
    product_variant_images: ProductVariantImage[];
}

interface ProductCategory {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    base_price: number;
    product_reference: string;
    categories?: ProductCategory;
    product_variants: ProductVariant[];
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [orderData, setOrderData] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '',
        note: '',
        email: '',
        color: '',
        size: '',
        payment_method: 'cash_on_delivery' as 'cash_on_delivery' | 'card',
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            if (!id) return;
            const productId = parseInt(id as string, 10);
            const res = await productsAPI.getById(productId);
            if (res.success) {
                setProduct(res.data);
                if (res.data.product_variants.length > 0) {
                    const firstVariant = res.data.product_variants[0];
                    setSelectedVariant(firstVariant);
                    setOrderData(prev => ({
                        ...prev,
                        color: firstVariant.color,
                        size: firstVariant.size
                    }));
                    if (firstVariant.product_variant_images.length > 0) {
                        setSelectedImage(firstVariant.product_variant_images[0].image_url);
                    }
                }
            }
        } catch (error) {
            toast.error('Erreur lors du chargement du produit');
            console.error('Erreur produit:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleVariantSelect = useCallback((variant: ProductVariant) => {
        setSelectedVariant(variant);
        setOrderData(prev => ({
            ...prev,
            color: variant.color,
            size: variant.size
        }));
        if (variant.product_variant_images.length > 0) {
            setSelectedImage(variant.product_variant_images[0].image_url);
            setActiveImageIndex(0);
        }
        setQuantity(1);
    }, []);

    const handleQuantityChange = useCallback((change: number) => {
        if (!selectedVariant) return;

        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= selectedVariant.stock_quantity) {
            setQuantity(newQuantity);
        }
    }, [selectedVariant, quantity]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if ((name === 'color' || name === 'size') && product) {
            const matchingVariant = product.product_variants.find(variant =>
                variant.color === (name === 'color' ? value : orderData.color) &&
                variant.size === (name === 'size' ? value : orderData.size)
            );

            if (matchingVariant) {
                setSelectedVariant(matchingVariant);
                if (matchingVariant.product_variant_images.length > 0) {
                    setSelectedImage(matchingVariant.product_variant_images[0].image_url);
                    setActiveImageIndex(0);
                }
                setQuantity(1);
            }
        }

        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));
    }, [product, orderData.color, orderData.size]);

    const validateOrderData = useCallback(() => {
        if (!selectedVariant) {
            toast.error('Veuillez sélectionner une couleur et une taille');
            return false;
        }

        const requiredFields = [
            { field: orderData.full_name, message: 'Veuillez entrer votre nom complet' },
            { field: orderData.phone, message: 'Veuillez entrer votre numéro de téléphone' },
            { field: orderData.address, message: 'Veuillez entrer votre adresse' },
            { field: orderData.city, message: 'Veuillez entrer votre ville' },
        ];

        for (const { field, message } of requiredFields) {
            if (!field.trim()) {
                toast.error(message);
                return false;
            }
        }

        return true;
    }, [selectedVariant, orderData]);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateOrderData() || !selectedVariant) return;

        setOrderLoading(true);
        const loadingToast = toast.loading('Création de votre commande...');

        try {
            const orderPayload = {
                ...orderData,
                items: [{
                    variant_id: selectedVariant.id,
                    quantity: quantity
                }]
            };

            const response = await ordersAPI.create(orderPayload);

            if (response.success) {
                toast.dismiss(loadingToast);
                toast.success('Commande créée avec succès !');
                setOrderSuccess(true);
                setOrderNumber(response.data.order_number);

                setTimeout(() => {
                    setShowOrderForm(false);
                    setOrderData(prev => ({
                        ...prev,
                        full_name: '',
                        phone: '',
                        address: '',
                        city: '',
                        note: '',
                        email: '',
                    }));
                    setQuantity(1);
                }, 3000);
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Erreur lors de la création de la commande');
            console.error('Erreur création commande:', error);
        } finally {
            setOrderLoading(false);
        }
    };

    const availableColors = [...new Set(product?.product_variants.map(v => v.color) || [])];
    const availableSizes = [...new Set(product?.product_variants.map(v => v.size) || [])];

    const findVariantByColorAndSize = useCallback((color: string, size: string) => {
        return product?.product_variants.find(v =>
            v.color === color && v.size === size
        ) || null;
    }, [product]);

    const allImages = product?.product_variants.flatMap(v =>
        v.product_variant_images.map(img => ({
            ...img,
            color: v.color
        }))
    ) || [];

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FiShoppingBag className="w-12 h-12 text-yellow-400 animate-pulse" />
                    </div>
                </div>
                <p className="mt-6 text-lg text-gray-600 font-medium animate-pulse">Chargement du produit...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
                <div className="text-center max-w-md">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
                        <FiPackage className="w-20 h-20 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
                    <p className="text-gray-600 mb-8">Le produit que vous recherchez n'existe pas ou a été déplacé.</p>
                    <button
                        onClick={() => router.push('/client/new')}
                        className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Retour à la collection
                    </button>
                </div>
            </div>
        );
    }

    const hasDiscount = product.base_price > (selectedVariant?.price || 0);
    const discountPercentage = hasDiscount ? Math.round((1 - (selectedVariant?.price || 0) / product.base_price) * 100) : 0;

    return (
        <>
            <Toaster position="top-right" />

            {/* Breadcrumb */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-3 text-sm">
                        <button
                            onClick={() => router.push('/client/new')}
                            className="text-gray-500 hover:text-yellow-600 transition-colors"
                        >
                            Collection
                        </button>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-500">{product.categories?.name || 'Catégorie'}</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>
                    </nav>
                </div>
            </div>

            <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Images Gallery */}
                        <div className="space-y-6">
                            {/* Main Image */}
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 shadow-xl"
                            >
                                {selectedImage ? (
                                    <Image
                                        src={`${baseUrl}/uploads/${selectedImage}`}
                                        alt={`${product.name} - ${selectedVariant?.color}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiPackage className="w-32 h-32 text-gray-300" />
                                    </div>
                                )}

                                {/* Discount Badge */}
                                {hasDiscount && (
                                    <div className="absolute top-6 left-6">
                                        <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full shadow-lg transform -rotate-3">
                                            -{discountPercentage}%
                                        </div>
                                    </div>
                                )}

                                {/* Stock Badge */}
                                {selectedVariant && (
                                    <div className="absolute top-6 right-6">
                                        <div className={`px-4 py-2 rounded-full shadow-lg backdrop-blur-sm ${selectedVariant.stock_quantity > 10
                                                ? 'bg-green-500/90 text-white'
                                                : selectedVariant.stock_quantity > 0
                                                    ? 'bg-amber-500/90 text-white'
                                                    : 'bg-red-500/90 text-white'
                                            }`}>
                                            {selectedVariant.stock_quantity > 0
                                                ? `${selectedVariant.stock_quantity} en stock`
                                                : 'Épuisé'}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {allImages.map((img, index) => (
                                    <motion.button
                                        key={img.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedImage(img.image_url);
                                            setActiveImageIndex(index);
                                            const variant = product.product_variants.find(v => v.id === img.variant_id);
                                            if (variant) handleVariantSelect(variant);
                                        }}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img.image_url
                                                ? 'border-yellow-400 ring-2 ring-yellow-400/30'
                                                : 'border-gray-200 hover:border-yellow-300'
                                            }`}
                                    >
                                        <Image
                                            src={`${baseUrl}/uploads/${img.image_url}`}
                                            alt={`${img.color} - ${index + 1}`}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                        {selectedImage === img.image_url && (
                                            <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                                                <FiCheck className="w-5 h-5 text-yellow-600" />
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Product Features */}
                            <div className=" gap-4 pt-6">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-yellow-100 rounded-2xl border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <FiTruck className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Livraison rapide</p>
                                            <p className="text-sm text-gray-600">Sous 24-48h</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-8">
                            {/* Category & Rating */}
                            <div className="flex items-center justify-between">
                                {product.categories && (
                                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 font-semibold rounded-full border border-yellow-200">
                                        {product.categories.name}
                                    </span>
                                )}
                               
                            </div>

                            {/* Product Title */}
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-gray-500 mt-2">Ref: {product.product_reference}</p>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Price Display */}
                            {selectedVariant && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-baseline gap-3">
                                            {hasDiscount && (
                                                <span className="text-2xl font-bold text-red-500 line-through">
                                                    {product.base_price.toFixed(2)} TND
                                                </span>
                                            )}
                                            <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                                {selectedVariant.price.toFixed(2)} TND
                                            </span>
                                        </div>
                                        {hasDiscount && (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm">
                                                ÉCONOMISEZ {discountPercentage}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Color Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Couleur</h3>
                                    <span className="text-sm text-gray-500">Sélectionnez une couleur</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {availableColors.map((color) => {
                                        const isSelected = orderData.color === color;
                                        const variant = findVariantByColorAndSize(color, orderData.size) ||
                                            product.product_variants.find(v => v.color === color);

                                        return (
                                            <motion.button
                                                key={color}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => variant && handleVariantSelect(variant)}
                                                disabled={!variant}
                                                className={`relative px-5 py-3 rounded-xl transition-all border-2 ${isSelected
                                                        ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    } ${!variant ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 border-gray-200"
                                                        style={{ backgroundColor: color.toLowerCase() }}
                                                    />
                                                    <span className={`font-medium ${isSelected ? 'text-yellow-700' : 'text-gray-700'
                                                        }`}>
                                                        {color}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                                        <FiCheck className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Taille</h3>
                                    <span className="text-sm text-gray-500">Guide des tailles</span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {availableSizes.map((size) => {
                                        const isSelected = orderData.size === size;
                                        const isAvailable = product.product_variants.some(v =>
                                            v.color === orderData.color && v.size === size && v.stock_quantity > 0
                                        );

                                        return (
                                            <motion.button
                                                key={size}
                                                whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                                                whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                                                onClick={() => {
                                                    if (isAvailable) {
                                                        const variant = findVariantByColorAndSize(orderData.color, size);
                                                        if (variant) handleVariantSelect(variant);
                                                    }
                                                }}
                                                disabled={!isAvailable}
                                                className={`relative py-4 rounded-xl transition-all border-2 ${isSelected
                                                        ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                                                        : isAvailable
                                                            ? 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                                                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <span className={`font-bold text-lg ${isSelected ? 'text-yellow-700' : isAvailable ? 'text-gray-800' : 'text-gray-400'
                                                    }`}>
                                                    {size}
                                                </span>
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                                        <FiCheck className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                {!isAvailable && (
                                                    <div className="absolute top-0 right-0 w-4 h-4">
                                                        <div className="w-full h-0.5 bg-gray-400 transform rotate-45 origin-center" />
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity & Total */}
                            {selectedVariant && selectedVariant.stock_quantity > 0 && (
                                <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-900">Quantité</h3>
                                            <span className="text-sm text-gray-500">Max: {selectedVariant.stock_quantity}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden bg-white">
                                                <button
                                                    onClick={() => handleQuantityChange(-1)}
                                                    disabled={quantity <= 1}
                                                    className="px-6 py-4 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <span className="text-2xl font-bold">−</span>
                                                </button>
                                                <span className="px-8 py-4 text-2xl font-bold text-gray-900 min-w-[80px] text-center">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(1)}
                                                    disabled={quantity >= selectedVariant.stock_quantity}
                                                    className="px-6 py-4 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <span className="text-2xl font-bold">+</span>
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                                                    {(selectedVariant.price * quantity).toFixed(2)} TND
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => router.push('/client/new')}
                                            className="group flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
                                        >
                                            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                                            Retour
                                        </button>

                                        <AnimatePresence>
                                            {!showOrderForm ? (
                                                <motion.button
                                                    key="order-button"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    onClick={() => setShowOrderForm(true)}
                                                    className="group flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                                >
                                                    <FiShoppingBag className="group-hover:scale-110 transition-transform" />
                                                    Commander maintenant
                                                </motion.button>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Order Form Modal */}
                            <AnimatePresence>
                                {showOrderForm && !orderSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                                    >
                                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                            <div className="p-8">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h2 className="text-3xl font-bold text-gray-900">Finaliser la commande</h2>
                                                        <p className="text-gray-600 mt-2">Remplissez vos informations de livraison</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowOrderForm(false)}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                        disabled={orderLoading}
                                                    >
                                                        <span className="text-2xl">×</span>
                                                    </button>
                                                </div>

                                                <form onSubmit={handleCreateOrder} className="space-y-8">
  {/* --- Informations personnelles --- */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Nom complet *
      </label>
      <input
        type="text"
        name="full_name"
        value={orderData.full_name}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
        placeholder="Ex: Mohamed Ali"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Téléphone *
      </label>
      <input
        type="tel"
        name="phone"
        value={orderData.phone}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
        placeholder="Ex: 22 123 456"
        required
      />
    </div>
  </div>

  {/* --- Adresse --- */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Adresse complète *
    </label>
    <input
      type="text"
      name="address"
      value={orderData.address}
      onChange={handleInputChange}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
      placeholder="Rue, numéro, appartement..."
      required
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Ville *
      </label>
      <input
        type="text"
        name="city"
        value={orderData.city}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
        placeholder="Ex: Tunis"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Email (optionnel)
      </label>
      <input
        type="email"
        name="email"
        value={orderData.email}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
        placeholder="Ex: exemple@mail.com"
      />
    </div>
  </div>

  {/* --- Mode de paiement --- */}
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-700">
      Mode de paiement *
    </label>

    <label
      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
        orderData.payment_method === 'cash_on_delivery'
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="radio"
        name="payment_method"
        value="cash_on_delivery"
        checked={orderData.payment_method === 'cash_on_delivery'}
        onChange={handleInputChange}
        className="sr-only"
      />
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
          orderData.payment_method === 'cash_on_delivery'
            ? 'border-yellow-400 bg-yellow-400'
            : 'border-gray-300'
        }`}
      >
        {orderData.payment_method === 'cash_on_delivery' && (
          <div className="w-2.5 h-2.5 bg-white rounded-full" />
        )}
      </div>
      <div>
        <p className="font-semibold">Paiement à la livraison</p>
        <p className="text-sm text-gray-600">Espèces à la réception</p>
      </div>
    </label>
  </div>

  {/* --- Récapitulatif de la commande --- */}
  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
    <h4 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif</h4>
    <div className="space-y-3">
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600">Produit</span>
        <span className="font-semibold text-gray-900">{product.name}</span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600">Couleur & Taille</span>
        <span className="font-semibold text-gray-900">
          {orderData.color} / {orderData.size}
        </span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600">Quantité</span>
        <span className="font-semibold text-gray-900">{quantity}</span>
      </div>
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-gray-600">Prix unitaire</span>
        <div className="flex items-center gap-2">
          {hasDiscount && (
            <span className="text-red-500 line-through text-sm">
              {product.base_price.toFixed(2)} TND
            </span>
          )}
          <span className="font-semibold text-gray-900">
            {selectedVariant?.price.toFixed(2)} TND
          </span>
        </div>
      </div>
      <div className="pt-4 flex justify-between items-center">
        <span className="text-xl font-bold text-gray-900">Total à payer</span>
        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
          {selectedVariant ? (selectedVariant.price * quantity).toFixed(2) : '0.00'} TND
        </span>
      </div>
    </div>
  </div>

  {/* --- Actions du formulaire --- */}
  <div className="flex flex-col md:flex-row gap-4 pt-6">
    <button
      type="button"
      onClick={() => setShowOrderForm(false)}
      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
      disabled={orderLoading}
    >
      Annuler
    </button>

    <button
      type="submit"
      disabled={orderLoading || !selectedVariant}
      className="group flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {orderLoading ? (
        <>
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          <FiCreditCard className="group-hover:scale-110 transition-transform" />
          Confirmer
        </>
      )}
    </button>
  </div>
</form>

                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success Modal */}
                            <AnimatePresence>
                                {orderSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                                    >
                                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                                            <div className="p-8 text-center">
                                                {/* Success Icon */}
                                                <div className="relative">
                                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                                        <FiCheck className="w-12 h-12 text-white" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2">
                                                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                                            <FiShoppingBag className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Success Message */}
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Commande confirmée !</h3>
                                                <p className="text-gray-600 mb-6">
                                                    Votre commande <span className="font-bold text-yellow-600">{orderNumber}</span> a été créée avec succès.
                                                </p>

                                                <div className="space-y-4 mb-8">

                                                    <p className="text-sm text-gray-500">
                                                        Notre équipe vous contactera dans les 24h pour confirmer la livraison.
                                                    </p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => {
                                                            setOrderSuccess(false);
                                                            setShowOrderForm(false);
                                                        }}
                                                        className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                                                    >
                                                        Continuer mes achats
                                                    </button>
                                                    <button
                                                        onClick={() => router.push('/client/new')}
                                                        className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                                                    >
                                                        Retour à la collection
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}