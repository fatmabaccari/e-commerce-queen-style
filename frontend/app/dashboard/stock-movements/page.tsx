'use client';

import { useEffect, useState, useMemo } from 'react';
import { stockMovementsAPI, variantsAPI } from '@/lib/api';
import { Plus, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StockMovement {
  id: number;
  variant_id: number;
  change_amount: number;
  reason: string;
  created_at: string;
  admin_id?: number | null;
  admin?: {
    id: number;
    email: string;
    name?: string;
  } | null;
  product_variants?: {
    id: number;
    size: string;
    color: string;
    stock_quantity: number;
    products: {
      id: number;
      name: string;
      product_reference: string;
    };
  };
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [variants, setVariants] = useState<{ id: number; size: string; color: string; products: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [formData, setFormData] = useState({
    variant_id: '',
    change_amount: '',
    reason: '',
  });

  useEffect(() => {
    fetchMovements();
    fetchVariants();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await stockMovementsAPI.getAll();
      setMovements(response.data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await variantsAPI.getAll();
      setVariants(response.data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockMovementsAPI.create({
        variant_id: Number(formData.variant_id),
        change_amount: Number(formData.change_amount),
        reason: formData.reason,
      });
      setFormData({ variant_id: '', change_amount: '', reason: '' });
      setShowForm(false);
      fetchMovements();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Échec de la création du mouvement de stock');
      setShowErrorModal(true);
    }
  };

  // Filter movements based on search criteria
  const filteredMovements = useMemo(() => {
    let filtered = movements;

    const query = searchQuery.toLowerCase().trim();
    const sizeLower = sizeFilter.toLowerCase().trim();
    const colorLower = colorFilter.toLowerCase().trim();

    if (query || sizeLower || colorLower) {
      filtered = filtered.filter(movement => {
        const variant = movement.product_variants;
        if (!variant) return false;

        // Search query matches product name, reference, or reason
        const matchesSearch = !query || 
          variant.products.name.toLowerCase().includes(query) ||
          variant.products.product_reference.toLowerCase().includes(query) ||
          movement.reason.toLowerCase().includes(query) ||
          (movement.admin?.email?.toLowerCase().includes(query) || false) ||
          (movement.admin?.name?.toLowerCase().includes(query) || false);

        // Size filter
        const matchesSize = !sizeLower || 
          variant.size.toLowerCase().includes(sizeLower);

        // Color filter
        const matchesColor = !colorLower || 
          variant.color.toLowerCase().includes(colorLower);

        return matchesSearch && matchesSize && matchesColor;
      });
    }

    return filtered;
  }, [movements, searchQuery, sizeFilter, colorFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mouvements de stock</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-black text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un mouvement
        </button>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par produit, référence, raison, admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <input
            type="text"
            placeholder="Filtrer par taille..."
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />

          <input
            type="text"
            placeholder="Filtrer par couleur..."
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />

          {(searchQuery || sizeFilter || colorFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSizeFilter('');
                setColorFilter('');
              }}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Effacer les filtres
            </button>
          )}
        </div>
        {(searchQuery || sizeFilter || colorFilter) && (
          <div className="mt-3 text-sm text-gray-600">
            Affichage de {filteredMovements.length} sur {movements.length} mouvements
          </div>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nouveau mouvement de stock</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="variant_id" className="block text-sm font-medium text-gray-700 mb-2">
                Variante de produit *
              </label>
              <select
                id="variant_id"
                required
                value={formData.variant_id}
                onChange={(e) => setFormData({ ...formData, variant_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">Sélectionner une variante</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.products.name} - {variant.size} / {variant.color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="change_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant du changement * (positif pour ajouter, négatif pour soustraire)
              </label>
              <input
                id="change_amount"
                type="number"
                required
                value={formData.change_amount}
                onChange={(e) => setFormData({ ...formData, change_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Raison *
              </label>
              <input
                id="reason"
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="ex. : Ajustement manuel, Articles retournés, etc."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-black text-yellow-400 py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                Créer le mouvement
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ variant_id: '', change_amount: '', reason: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement des mouvements de stock...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {movements.length === 0 ? 'Aucun mouvement de stock trouvé' : 'Aucun mouvement ne correspond aux filtres de recherche'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant du changement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.map((movement) => {
                const currentStock = movement.product_variants?.stock_quantity ?? 0;
                const stockBefore = currentStock - movement.change_amount;
                
                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {movement.product_variants?.products.name || 'Unknown Product'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          Réf. : {movement.product_variants?.products.product_reference || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.product_variants ? (
                        <div className="flex items-center">
                          <div
                            className="w-5 h-5 rounded-full border border-gray-300 mr-2"
                            style={{ backgroundColor: movement.product_variants.color.toLowerCase() }}
                            title={movement.product_variants.color}
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{movement.product_variants.size}</div>
                            <div className="text-xs text-gray-500">{movement.product_variants.color}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">ID Variante : {movement.variant_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${
                          movement.change_amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.change_amount > 0 ? '+' : ''}{movement.change_amount}
                        </span>
                        <span className="text-xs text-gray-500">
                          {stockBefore} → {currentStock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        currentStock > 10 ? 'text-green-600' : currentStock > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">{movement.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {movement.admin ? (movement.admin.name || movement.admin.email) : 'Système'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{format(new Date(movement.created_at), 'd MMM yyyy', { locale: fr })}</div>
                      <div className="text-xs text-gray-400">{format(new Date(movement.created_at), 'HH:mm')}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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

