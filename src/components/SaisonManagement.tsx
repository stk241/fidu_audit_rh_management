import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Calendar, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type Saison = Database['public']['Tables']['saisons']['Row'];

export function SaisonManagement() {
  const [saisons, setSaisons] = useState<Saison[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    status: 'ACTIVE' as 'ACTIVE' | 'ARCHIVED',
  });

  useEffect(() => {
    fetchSaisons();
  }, []);

  const fetchSaisons = async () => {
    try {
      const { data, error } = await supabase
        .from('saisons')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSaisons(data || []);
    } catch (err) {
      console.error('Error fetching saisons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('saisons')
        .insert([formData]);

      if (error) throw error;

      setCreating(false);
      setFormData({ name: '', start_date: '', end_date: '', status: 'ACTIVE' });
      fetchSaisons();
    } catch (err) {
      console.error('Error creating saison:', err);
      alert('Erreur lors de la création de la saison');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saisons')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      fetchSaisons();
    } catch (err) {
      console.error('Error updating saison:', err);
      alert('Erreur lors de la mise à jour de la saison');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette saison ?')) return;

    try {
      const { error } = await supabase
        .from('saisons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSaisons();
    } catch (err) {
      console.error('Error deleting saison:', err);
      alert('Erreur lors de la suppression de la saison');
    }
  };

  const startEdit = (saison: Saison) => {
    setEditingId(saison.id);
    setFormData({
      name: saison.name,
      start_date: saison.start_date,
      end_date: saison.end_date,
      status: saison.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreating(false);
    setFormData({ name: '', start_date: '', end_date: '', status: 'ACTIVE' });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Saisons</h2>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle saison</span>
          </button>
        )}
      </div>

      {creating && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Nouvelle saison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Ex: Saison 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'ARCHIVED' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archivée</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Créer</span>
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
            >
              <X className="w-4 h-4" />
              <span>Annuler</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {saisons.map((saison) => (
          <div
            key={saison.id}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            {editingId === saison.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'ARCHIVED' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archivée</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(saison.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                    <span>Annuler</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{saison.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      saison.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {saison.status === 'ACTIVE' ? 'Active' : 'Archivée'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Du {new Date(saison.start_date).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(saison.end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(saison)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(saison.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {saisons.length === 0 && (
        <div className="text-center py-12 text-slate-600">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p>Aucune saison créée</p>
          <p className="text-sm">Créez votre première saison pour commencer</p>
        </div>
      )}
    </div>
  );
}
