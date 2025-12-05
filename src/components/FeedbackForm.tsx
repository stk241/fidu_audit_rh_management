import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, MessageSquare } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Feedback = Database['public']['Tables']['feedbacks']['Row'];

interface FeedbackFormProps {
  collaboratorId: string;
  collaboratorName: string;
  saisonId: string;
  authorId: string;
  existingFeedback?: Feedback;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeedbackForm({
  collaboratorId,
  collaboratorName,
  saisonId,
  authorId,
  existingFeedback,
  onClose,
  onSuccess,
}: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!existingFeedback;

  useEffect(() => {
    if (existingFeedback) {
      setContent(existingFeedback.content);
      setMission(existingFeedback.mission || '');
    }
  }, [existingFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);

      if (isEditing && existingFeedback) {
        const { error: updateError } = await supabase
          .from('feedbacks')
          .update({
            content,
            mission: mission || null,
          })
          .eq('id', existingFeedback.id);

        if (updateError) throw updateError;
      } else {
        console.log('Creating feedback with:', {
          content,
          mission: mission || null,
          collaborator_id: collaboratorId,
          author_id: authorId,
          saison_id: saisonId,
        });

        const { data, error: insertError } = await supabase.from('feedbacks').insert({
          content,
          mission: mission || null,
          collaborator_id: collaboratorId,
          author_id: authorId,
          saison_id: saisonId,
        }).select();

        console.log('Insert result:', { data, error: insertError });
        if (insertError) {
          console.error('Full error details:', JSON.stringify(insertError, null, 2));
        }

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      setError(`Erreur lors de ${isEditing ? 'la modification' : 'la création'} du feedback: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-fidu-700" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Modifier le feedback' : 'Nouveau feedback'}
              </h2>
              <p className="text-sm text-gray-600">{collaboratorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
              Mission (optionnel)
            </label>
            <input
              id="mission"
              type="text"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fidu-600 focus:border-transparent outline-none transition"
              placeholder="Nom de la mission"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fidu-600 focus:border-transparent outline-none transition resize-none"
              placeholder="Notez ici vos observations sur le travail du collaborateur..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-fidu-700 hover:bg-fidu-800 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
