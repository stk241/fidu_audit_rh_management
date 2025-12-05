import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Users, LogOut, Calendar } from 'lucide-react';
import { AdminMenu } from './AdminMenu';
import { SaisonManagement } from './SaisonManagement';
import { UserManagement } from './UserManagement';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Saison = Database['public']['Tables']['saisons']['Row'];

interface DashboardProps {
  onSelectCollaborator: (collaborator: UserProfile) => void;
}

export function Dashboard({ onSelectCollaborator }: DashboardProps) {
  const { profile, signOut } = useAuth();
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [activeSaison, setActiveSaison] = useState<Saison | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminView, setAdminView] = useState<'dashboard' | 'saisons' | 'users'>('dashboard');

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    try {
      const { data: saisonData } = await supabase
        .from('saisons')
        .select('*')
        .eq('status', 'ACTIVE')
        .maybeSingle();

      setActiveSaison(saisonData);

      let query = supabase
        .from('users')
        .select('*')
        .order('last_name', { ascending: true });

      if (profile.role === 'ADMIN') {
        query = query.eq('role', 'CHEF_DE_MISSION');
      } else if (profile.role === 'CHEF_DE_MISSION') {
        query = query.eq('role', 'ASSISTANT');
      }

      const { data, error } = await query;

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-fidu-700">FIDU AUDIT RH</h1>
              <p className="text-sm text-gray-600 mt-1">
                {profile?.first_name} {profile?.last_name} • {profile?.role.replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile?.role === 'ADMIN' && (
          <div className="mb-6">
            <AdminMenu activeView={adminView} onViewChange={setAdminView} />
          </div>
        )}

        {profile?.role === 'ADMIN' && adminView === 'saisons' ? (
          <SaisonManagement />
        ) : profile?.role === 'ADMIN' && adminView === 'users' ? (
          <UserManagement />
        ) : (
          <>
        {activeSaison && (
          <div className="bg-fidu-50 border border-fidu-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-fidu-700" />
            <div>
              <p className="text-sm font-medium text-fidu-900">Saison active</p>
              <p className="text-sm text-fidu-700">{activeSaison.name}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-fidu-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Collaborateurs à évaluer
              </h2>
              <span className="ml-auto text-sm text-gray-600">
                {collaborators.length} {collaborators.length > 1 ? 'personnes' : 'personne'}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {collaborators.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-600">
                Aucun collaborateur à évaluer pour le moment
              </div>
            ) : (
              collaborators.map((collaborator) => (
                <button
                  key={collaborator.id}
                  onClick={() => onSelectCollaborator(collaborator)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition flex items-center justify-between group"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {collaborator.first_name} {collaborator.last_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {collaborator.role.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-fidu-700 opacity-0 group-hover:opacity-100 transition font-medium">
                    Voir le dossier →
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
