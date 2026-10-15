'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usersAPI, ordersAPI } from '@/lib/api';
import { Edit, Trash2, Search, X, Mail, Phone, MapPin, ShoppingCart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserAddress {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  note: string | null;
  created_at: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_addresses?: UserAddress[];
  orders?: any[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [userOrdersCount, setUserOrdersCount] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch order counts for all users
    if (users.length > 0) {
      fetchUserOrdersCounts();
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la récupération des utilisateurs');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrdersCounts = async () => {
    try {
      const counts: Record<number, number> = {};
      await Promise.all(
        users.map(async (user) => {
          try {
            const response = await ordersAPI.getAll({ user_id: user.id, page: 1, limit: 1 });
            counts[user.id] = response.pagination?.totalItems || 0;
          } catch (error) {
            counts[user.id] = 0;
          }
        })
      );
      setUserOrdersCount(counts);
    } catch (error) {
      console.error('Error fetching user orders counts:', error);
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
      await usersAPI.delete(pendingDeleteId);
      fetchUsers();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la suppression de l\'utilisateur');
      setShowErrorModal(true);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query)) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const toggleExpand = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600">
            Affichage de {filteredUsers.length} sur {users.length} utilisateurs
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur ne correspond aux filtres de recherche'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isExpanded = expandedUserId === user.id;
                  const addresses = user.user_addresses || [];
                  const ordersCount = userOrdersCount[user.id] || 0;

                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.phone ? (
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 mr-1" />
                                {user.phone}
                              </div>
                            ) : (
                              <span className="text-gray-400">Pas de téléphone</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <ShoppingCart className="w-4 h-4 mr-1 text-yellow-600" />
                            {ordersCount} {ordersCount === 1 ? 'commande' : 'commandes'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(user.created_at), 'd MMM yyyy', { locale: fr })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleExpand(user.id)}
                              className="text-yellow-600 hover:text-yellow-700 text-sm"
                            >
                              {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                            </button>
                            <Link
                              href={`/dashboard/users/${user.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Modifier l'utilisateur"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Informations utilisateur</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">Nom complet :</span>
                                    <span className="ml-2 text-gray-900">
                                      {user.first_name} {user.last_name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Email :</span>
                                    <span className="ml-2 text-gray-900 flex items-center">
                                      <Mail className="w-4 h-4 mr-1" />
                                      {user.email}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Téléphone :</span>
                                    <span className="ml-2 text-gray-900">
                                      {user.phone || 'Non fourni'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Membre depuis :</span>
                                    <span className="ml-2 text-gray-900">
                                      {format(new Date(user.created_at), 'd MMMM yyyy', { locale: fr })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {addresses.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Adresses enregistrées ({addresses.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {addresses.map((address) => (
                                      <div
                                        key={address.id}
                                        className="bg-white p-3 rounded border border-gray-200 text-sm"
                                      >
                                        <div className="font-medium text-gray-900">{address.full_name}</div>
                                        <div className="text-gray-600">{address.address}</div>
                                        <div className="text-gray-600">
                                          {address.city} {address.phone && `• ${address.phone}`}
                                        </div>
                                        {address.note && (
                                          <div className="text-gray-500 italic mt-1">Note : {address.note}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {addresses.length === 0 && (
                                <div className="text-sm text-gray-500">Aucune adresse enregistrée</div>
                              )}

                              <div>
                                <Link
                                  href={`/dashboard/orders?user_id=${user.id}`}
                                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium inline-flex items-center"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1" />
                                  Voir toutes les commandes ({ordersCount})
                                </Link>
                              </div>
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supprimer l&apos;utilisateur</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible. Toutes les données associées
                (adresses, historique des commandes) seront conservées à des fins de tenue de registres.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Erreur</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors"
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

