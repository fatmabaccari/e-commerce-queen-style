'use client';

import { useEffect, useState, useRef } from 'react';
import { ordersAPI } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Eye, Phone, Mail, MapPin, Package, ChevronLeft, ChevronRight, Download, FileText, Calendar } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  products: {
    id: number;
    name: string;
    product_reference: string;
  };
  product_variants: {
    id: number;
    size: string;
    color: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  note?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount_total: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'card';
  created_at: string;
  user: { id: number; email: string } | null;
  order_items?: OrderItem[];
}

const statusColors = {
  pending: 'bg-yellow-200 text-yellow-900',
  processing: 'bg-blue-200 text-blue-900',
  shipped: 'bg-purple-200 text-purple-900',
  delivered: 'bg-green-200 text-green-900',
  cancelled: 'bg-red-200 text-red-900',
};

const statusRowColors = {
  pending: 'bg-yellow-200 hover:bg-white active:bg-white',
  processing: 'bg-blue-200 hover:bg-white active:bg-white',
  shipped: 'bg-purple-200 hover:bg-white active:bg-white',
  delivered: 'bg-green-200 hover:bg-white active:bg-white',
  cancelled: 'bg-red-200 hover:bg-white active:bg-white',
};

const formatPaymentMethod = (method: string): string => {
  const methods: { [key: string]: string } = {
    cash_on_delivery: 'Paiement à la livraison',
    card: 'Carte',
  };
  return methods[method] || method.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédié',
    delivered: 'Livré',
    cancelled: 'Annulé',
  };
  return labels[status] || status;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ orderId: number; newStatus: string } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchQuery, startDate, endDate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) {
        // Note: Backend would need to support search, for now we filter client-side
        // params.search = searchQuery;
      }

      const response = await ordersAPI.getAll(params);
      
      let filteredOrders = response.data || [];
      
      // Client-side search filtering (until backend supports it)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter((order: Order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.full_name.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query) ||
          order.phone.includes(query)
        );
      }

      // Date range filtering
      if (startDate || endDate) {
        filteredOrders = filteredOrders.filter((order: Order) => {
          const orderDate = new Date(order.created_at);
          orderDate.setHours(0, 0, 0, 0); // Reset time to start of day
          
          if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // End of day
            return orderDate >= start && orderDate <= end;
          } else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            return orderDate >= start;
          } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return orderDate <= end;
          }
          return true;
        });
      }
      
      setOrders(filteredOrders);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalOrders(response.pagination?.totalItems || 0);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Échec de la récupération des commandes : ' + (error.response?.data?.message || error.message));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const currentStatus = order?.status;
    
    if (currentStatus === newStatus) return;
    
    // Show confirmation modal
    setPendingStatusUpdate({ orderId, newStatus });
    setShowConfirmationModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;

    const { orderId, newStatus } = pendingStatusUpdate;
    setShowConfirmationModal(false);

    const order = orders.find(o => o.id === orderId);
    const previousStatus = order?.status;

    // Optimistically update the UI
    setOrders(prevOrders => 
      prevOrders.map(o => 
        o.id === orderId ? { ...o, status: newStatus as any } : o
      )
    );

    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus as any);
      
      // Check if response indicates success
      if (response && (response.success || response.data)) {
        // If successful, refresh the orders list to get the latest data
        try {
          await fetchOrders();
        } catch (fetchError: any) {
          // If fetch fails, log but don't revert - the status update was successful
          console.warn('Failed to refresh orders list after status update:', fetchError);
          // The optimistic update will remain, which is fine since the backend update succeeded
        }
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error: any) {
      // Revert the optimistic update on error
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === orderId ? { ...o, status: previousStatus as any } : o
        )
      );
      
      // Show error message
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update order status';
      console.error('Error updating order status:', error);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setPendingStatusUpdate(null);
    }
  };

  const cancelStatusUpdate = () => {
    setShowConfirmationModal(false);
    setPendingStatusUpdate(null);
  };

  const handleViewReceipt = async (orderId: number) => {
    try {
      const orderDetails = await ordersAPI.getById(orderId);
      setSelectedOrder(orderDetails.data);
      setShowReceiptModal(true);
    } catch (error: any) {
      setErrorMessage('Échec de la récupération des détails de la commande : ' + (error.response?.data?.message || error.message));
      setShowErrorModal(true);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !selectedOrder) return;

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      const element = receiptRef.current;
      const opt: any = {
        margin: [10, 10, 10, 10],
        filename: `${selectedOrder.order_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Échec de la génération du PDF. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commandes</h1>
        {totalOrders > 0 && (
          <div className="text-sm text-gray-500">
            Total : <span className="font-semibold text-gray-900">{totalOrders}</span> commandes
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par numéro de commande, nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="shipped">Expédié</option>
            <option value="delivered">Livré</option>
            <option value="cancelled">Annulé</option>
          </select>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              placeholder="Date de début"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              placeholder="Date de fin"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
              className="text-sm text-yellow-600 hover:text-yellow-700 underline"
            >
              Effacer les filtres de date
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des commandes...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'Aucune commande trouvée correspondant à votre recherche' : 'Aucune commande trouvée'}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande #
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`${statusRowColors[order.status]} transition-colors cursor-pointer`}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.order_number}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </div>
                        {order.user?.email && (
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {order.user.email}
                          </div>
                        )}
                        {!order.user && (
                          <div className="text-xs text-gray-400 mt-1">Invité</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPaymentMethod(order.payment_method)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{format(new Date(order.created_at), 'd MMM yyyy', { locale: fr })}</div>
                        <div className="text-xs text-gray-400">{format(new Date(order.created_at), 'HH:mm')}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewReceipt(order.id)}
                            className="text-yellow-600 hover:text-yellow-700 p-1 rounded hover:bg-yellow-50 transition-colors"
                            title="Voir le reçu"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="pending">En attente</option>
                            <option value="processing">En traitement</option>
                            <option value="shipped">Expédié</option>
                            <option value="delivered">Livré</option>
                            <option value="cancelled">Annulé</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 ${statusRowColors[order.status]} transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        {order.order_number}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{order.phone}</span>
                    </div>
                    {order.user?.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{order.user.email}</span>
                      </div>
                    )}
                    {!order.user && (
                      <div className="text-xs text-gray-400">Invité</div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500">Paiement</div>
                        <div className="text-sm text-gray-700">{formatPaymentMethod(order.payment_method)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(order.created_at), 'd MMM yyyy', { locale: fr })} {format(new Date(order.created_at), 'HH:mm')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewReceipt(order.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-yellow-600 hover:text-yellow-700 py-2 px-3 rounded border border-yellow-300 hover:bg-yellow-50 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Reçu</span>
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded px-2 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédié</option>
                      <option value="delivered">Livré</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Page {page} sur {totalPages}
                  {totalOrders > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({totalOrders} commandes au total)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    title="Page précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    title="Page suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header with Actions */}
            <div className="p-6 border-b border-gray-200 print:hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reçu</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Content */}
            <div id="receipt-content" ref={receiptRef} className="p-6 bg-white">
              {/* Company Header */}
              <div className="text-center mb-4">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/logo.jpg"
                    alt="Queen Style Logo"
                    width={150}
                    height={62}
                    className="object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Queen Style</h1>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Phone: +212 XXX XXX XXX</p>
                  <p>Email: info@queenstyle.com</p>
                  <p>Address: [Your Address Here]</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">Reçu de commande</p>
              </div>

              {/* Order Info - Compact */}
              <div className="mb-4 border-b border-gray-200 pb-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-600"><span className="font-semibold">Commande #:</span> {selectedOrder.order_number}</p>
                    <p className="text-gray-600"><span className="font-semibold">Date:</span> {format(new Date(selectedOrder.created_at), 'd MMM yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><span className="font-semibold">Client:</span> {selectedOrder.full_name}</p>
                    <p className="text-gray-600"><span className="font-semibold">Téléphone:</span> {selectedOrder.phone}</p>
                    {selectedOrder.user?.email && (
                      <p className="text-gray-600"><span className="font-semibold">Email:</span> {selectedOrder.user.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600"><span className="font-semibold">Livraison:</span> {selectedOrder.address}, {selectedOrder.city}</p>
                  {selectedOrder.note && (
                    <p className="text-xs text-gray-500 mt-1 italic">Note : {selectedOrder.note}</p>
                  )}
                </div>
              </div>

              {/* Order Items - Compact with max height */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Articles de commande</h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-1.5 px-2 font-semibold text-gray-700">Produit</th>
                        <th className="text-left py-1.5 px-2 font-semibold text-gray-700">Variante</th>
                        <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Qté</th>
                        <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Prix</th>
                        <th className="text-right py-1.5 px-2 font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                        selectedOrder.order_items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-1.5 px-2 text-gray-900">
                              <div className="font-medium">{item.products.name}</div>
                              <div className="text-gray-500">Réf. : {item.products.product_reference}</div>
                            </td>
                            <td className="py-1.5 px-2 text-gray-600">
                              {item.product_variants.size} / {item.product_variants.color}
                            </td>
                            <td className="py-1.5 px-2 text-gray-900 text-right">{item.quantity}</td>
                            <td className="py-1.5 px-2 text-gray-900 text-right">{formatCurrency(item.price)}</td>
                            <td className="py-1.5 px-2 font-medium text-gray-900 text-right">{formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-3 text-center text-gray-500">Aucun article trouvé</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals - Compact */}
              <div className="border-t-2 border-gray-300 pt-3 mb-3">
                <div className="flex justify-end">
                  <div className="w-56">
                    <div className="flex justify-between py-1 text-xs">
                      <span className="text-gray-600">Sous-total :</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount_total > 0 && (
                      <div className="flex justify-between py-1 text-xs">
                        <span className="text-gray-600">Remise :</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(selectedOrder.discount_total)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 text-sm font-bold border-t border-gray-300 mt-1 pt-1.5">
                      <span>Total :</span>
                      <span>{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">Paiement : <span className="font-medium text-gray-900">{formatPaymentMethod(selectedOrder.payment_method)}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Compact */}
              <div className="pt-3 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Merci pour votre achat !</p>
                <p className="mt-1">Pour toute demande : info@queenstyle.com | +212 XXX XXX XXX</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {showConfirmationModal && pendingStatusUpdate && (() => {
        const order = orders.find(o => o.id === pendingStatusUpdate.orderId);
        if (!order) return null;
        
        const currentStatus = order.status;
        const newStatus = pendingStatusUpdate.newStatus;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmer la mise à jour du statut</h2>
                <p className="text-gray-700 mb-6">
                  Êtes-vous sûr de vouloir changer le statut de la commande <span className="font-semibold">#{order.order_number}</span> de{' '}
                  <span className="font-semibold">{getStatusLabel(currentStatus)}</span> à{' '}
                  <span className="font-semibold">{getStatusLabel(newStatus)}</span> ?
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={cancelStatusUpdate}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmStatusUpdate}
                    className="px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
