import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { ArrowLeft, Plus, MessageSquare, FileText, Trash2, Edit } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { ReportEditor } from './ReportEditor';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Feedback = Database['public']['Tables']['feedbacks']['Row'] & {
  author: UserProfile;
};
type Rapport = Database['public']['Tables']['rapports']['Row'];
type Saison = Database['public']['Tables']['saisons']['Row'];

interface CollaboratorDetailProps {
  collaborator: UserProfile;
  onBack: () => void;
}

export function CollaboratorDetail({ collaborator, onBack }: CollaboratorDetailProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'feedbacks' | 'rapport'>('feedbacks');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [saisons, setSaisons] = useState<Saison[]>([]);
  const [selectedSaison, setSelectedSaison] = useState<Saison | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [collaborator.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: saisonsData } = await supabase
        .from('saisons')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('start_date', { ascending: false });

      setSaisons(saisonsData || []);

      if (saisonsData && saisonsData.length > 0) {
        const saison = selectedSaison || saisonsData[0];
        setSelectedSaison(saison);
        await loadSaisonData(saison.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSaisonData = async (saisonId: string) => {
    try {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedbacks')
        .select('*, author:users!feedbacks_author_id_fkey(*)')
        .eq('collaborator_id', collaborator.id)
        .eq('saison_id', saisonId)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedbacks(feedbackData as Feedback[]);

      const { data: rapportData } = await supabase
        .from('rapports')
        .select('*')
        .eq('collaborator_id', collaborator.id)
        .eq('saison_id', saisonId)
        .maybeSingle();

      setRapport(rapportData);
    } catch (error) {
      console.error('Error loading saison data:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce feedback ?')) return;

    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Erreur lors de la suppression du feedback');
    }
  };

  const handleEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setShowFeedbackForm(true);
  };

  const handleCloseFeedbackForm = () => {
    setShowFeedbackForm(false);
    setEditingFeedback(null);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-fidu-700 mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-fidu-700">
              {collaborator.first_name} {collaborator.last_name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {collaborator.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('feedbacks')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition font-medium ${
                  activeTab === 'feedbacks'
                    ? 'border-fidu-700 text-fidu-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Feedbacks ({feedbacks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('rapport')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition font-medium ${
                  activeTab === 'rapport'
                    ? 'border-fidu-700 text-fidu-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Rapport</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'feedbacks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Historique des feedbacks
                  </h2>
                  {selectedSaison && (
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-fidu-700 hover:bg-fidu-800 text-white rounded-lg transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un feedback</span>
                    </button>
                  )}
                </div>

                {saisons.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Saison :</label>
                    <select
                      value={selectedSaison?.id || ''}
                      onChange={(e) => {
                        const saison = saisons.find(s => s.id === e.target.value);
                        if (saison) {
                          setSelectedSaison(saison);
                          loadSaisonData(saison.id);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fidu-600 focus:border-transparent outline-none"
                    >
                      {saisons.map(saison => (
                        <option key={saison.id} value={saison.id}>
                          {saison.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {feedbacks.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun feedback pour cette saison</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {feedback.author.first_name} {feedback.author.last_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(feedback.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          {profile?.id === feedback.author_id && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditFeedback(feedback)}
                                className="text-gray-400 hover:text-fidu-700 transition"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(feedback.id)}
                                className="text-gray-400 hover:text-red-600 transition"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        {feedback.mission && (
                          <p className="text-xs text-fidu-700 mb-2 font-medium">
                            Mission: {feedback.mission}
                          </p>
                        )}
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rapport' && selectedSaison && (
              <ReportEditor
                collaborator={collaborator}
                saison={selectedSaison}
                rapport={rapport}
                feedbacks={feedbacks}
                onUpdate={loadData}
              />
            )}
          </div>
        </div>
      </main>

      {showFeedbackForm && selectedSaison && profile && (
        <>
          {console.log('Opening FeedbackForm with:', {
            collaboratorId: collaborator.id,
            collaboratorRole: collaborator.role,
            authorId: profile.id,
            authorRole: profile.role,
            saisonId: selectedSaison.id,
          })}
          <FeedbackForm
            collaboratorId={collaborator.id}
            collaboratorName={`${collaborator.first_name} ${collaborator.last_name}`}
            saisonId={selectedSaison.id}
            authorId={profile.id}
            existingFeedback={editingFeedback || undefined}
            onClose={handleCloseFeedbackForm}
            onSuccess={loadData}
          />
        </>
      )}
    </div>
  );
}
