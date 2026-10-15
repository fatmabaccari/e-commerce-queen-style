'use client';

import { useEffect, useState } from 'react';
import { ordersAPI, productsAPI, categoriesAPI, heroSlidesAPI, contactsAPI } from '@/lib/api';
import { Package, ShoppingCart, FolderTree, TrendingUp, DollarSign, Calendar, BarChart3, Clock } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/currency';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  pendingOrders: number;
}


interface OrderAnalysis {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paymentMethodBreakdown: {
    cash_on_delivery: number;
    card: number;
  };
  recentOrders: any[];
}





export default function DashboardPage() {


  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingOrders: 0,
  });
  const [analysis, setAnalysis] = useState<OrderAnalysis>({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    statusBreakdown: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    paymentMethodBreakdown: {
      cash_on_delivery: 0,
      card: 0,
    },
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {



    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({ page: 1, limit: 1 }),
          ordersAPI.getAll({ page: 1, limit: 1 }),
          categoriesAPI.getAll(),
        ]);

        const pendingOrdersRes = await ordersAPI.getAll({ status: 'pending', page: 1, limit: 1 });

        setStats({
          totalProducts: productsRes.pagination?.totalItems || 0,
          totalOrders: ordersRes.pagination?.totalItems || 0,
          totalCategories: categoriesRes.data?.length || 0,
          pendingOrders: pendingOrdersRes.pagination?.totalItems || 0,
        });

        // Fetch all orders for analysis (paginate through all pages)
        let allOrders: any[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        const pageSize = 100;

        while (hasMorePages) {
          const ordersRes = await ordersAPI.getAll({ page: currentPage, limit: pageSize });
          const pageOrders = ordersRes.data || [];
          allOrders = [...allOrders, ...pageOrders];

          const totalPages = ordersRes.pagination?.totalPages || 1;
          hasMorePages = currentPage < totalPages;
          currentPage++;
        }

        // Calculate revenue from delivered orders only
        const totalRevenue = allOrders
          .filter((order: any) => order.status === 'delivered')
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        const today = new Date();
        const todayStart = startOfDay(today);
        const todayEnd = endOfDay(today);
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);

        const todayRevenue = allOrders
          .filter((order: any) => {
            const orderDate = new Date(order.created_at);
            return order.status === 'delivered' && orderDate >= todayStart && orderDate <= todayEnd;
          })
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        const monthRevenue = allOrders
          .filter((order: any) => {
            const orderDate = new Date(order.created_at);
            return order.status === 'delivered' && orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        // Status breakdown
        const statusBreakdown = {
          pending: allOrders.filter((o: any) => o.status === 'pending').length,
          processing: allOrders.filter((o: any) => o.status === 'processing').length,
          shipped: allOrders.filter((o: any) => o.status === 'shipped').length,
          delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
          cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
        };

        // Payment method breakdown
        const paymentMethodBreakdown = {
          cash_on_delivery: allOrders.filter((o: any) => o.payment_method === 'cash_on_delivery').length,
          card: allOrders.filter((o: any) => o.payment_method === 'card').length,
        };


        // Recent orders (last 5)
        const recentOrders = allOrders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setAnalysis({
          totalRevenue,
          todayRevenue,
          monthRevenue,
          statusBreakdown,
          paymentMethodBreakdown,
          recentOrders,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }

    };


    fetchStats();
  }, []);



  const statCards = [
    {
      name: 'Total Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      href: '/dashboard/products',
    },
    {
      name: 'Total Commandes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/dashboard/orders',
    },
    {
      name: 'Catégories',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'bg-purple-500',
      href: '/dashboard/categories',
    },
    {
      name: 'Commandes en attente',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/dashboard/orders?status=pending',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement du tableau de bord...</div>
      </div>
    );
  }

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>


      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      


      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenu total</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysis.totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-2">Revenu de tous les temps</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenu d&apos;aujourd&apos;hui</h3>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysis.todayRevenue)}</p>
          <p className="text-sm text-gray-500 mt-2">{format(new Date(), 'd MMMM yyyy', { locale: fr })}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ce mois-ci</h3>
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(analysis.monthRevenue)}</p>
          <p className="text-sm text-gray-500 mt-2">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
        </div>
      </div>

      {/* Order Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition des statuts de commande</h2>

          {/* Chart */}
          <div className="mb-6" style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'En attente', value: analysis.statusBreakdown.pending, color: '#ca8a04' },
                    { name: 'En traitement', value: analysis.statusBreakdown.processing, color: '#2563eb' },
                    { name: 'Expédié', value: analysis.statusBreakdown.shipped, color: '#6d28d9' },
                    { name: 'Livré', value: analysis.statusBreakdown.delivered, color: '#15803d' },
                    { name: 'Annulé', value: analysis.statusBreakdown.cancelled, color: '#dc2626' },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'En attente', value: analysis.statusBreakdown.pending, color: '#ca8a04' },
                    { name: 'En traitement', value: analysis.statusBreakdown.processing, color: '#2563eb' },
                    { name: 'Expédié', value: analysis.statusBreakdown.shipped, color: '#6d28d9' },
                    { name: 'Livré', value: analysis.statusBreakdown.delivered, color: '#15803d' },
                    { name: 'Annulé', value: analysis.statusBreakdown.cancelled, color: '#dc2626' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ca8a04' }}></div>
                <span className="text-sm text-gray-700">En attente</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{analysis.statusBreakdown.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563eb' }}></div>
                <span className="text-sm text-gray-700">En traitement</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{analysis.statusBreakdown.processing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6d28d9' }}></div>
                <span className="text-sm text-gray-700">Expédié</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{analysis.statusBreakdown.shipped}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#15803d' }}></div>
                <span className="text-sm text-gray-700">Livré</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{analysis.statusBreakdown.delivered}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                <span className="text-sm text-gray-700">Annulé</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{analysis.statusBreakdown.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Commandes récentes</h2>
            <Link href="/dashboard/orders" className="text-sm text-yellow-600 hover:text-yellow-700">
              Voir tout
            </Link>
          </div>
          {analysis.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysis.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.full_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                          order.status === 'processing' ? 'bg-blue-200 text-blue-900' :
                            order.status === 'shipped' ? 'bg-purple-200 text-purple-900' :
                              order.status === 'delivered' ? 'bg-green-200 text-green-900' :
                                'bg-red-200 text-red-900'
                          }`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount || 0)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{format(new Date(order.created_at), 'd MMM yyyy HH:mm', { locale: fr })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune commande récente</p>
          )}
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Méthode de paiement</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Paiement à la livraison</span>
            <span className="text-sm font-semibold text-gray-900">{analysis.paymentMethodBreakdown.cash_on_delivery}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Carte</span>
            <span className="text-sm font-semibold text-gray-900">{analysis.paymentMethodBreakdown.card}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total des commandes</span>
              <span className="text-sm font-bold text-gray-900">
                {analysis.paymentMethodBreakdown.cash_on_delivery + analysis.paymentMethodBreakdown.card}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/products/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Ajouter un produit</p>
          </Link>
          <Link
            href="/dashboard/categories/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-center"
          >
            <FolderTree className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Ajouter une catégorie</p>
          </Link>
          <Link
            href="/dashboard/discounts/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-center"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Créer une remise</p>
          </Link>
        </div>
      </div>
    </div>
  );
}