import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Sparkles, Save, CheckCircle, Loader, FileText, Trash2, Download } from 'lucide-react';
import { exportRapportToPDF } from '../utils/pdfExport';

type UserProfile = Database['public']['Tables']['users']['Row'];
type Feedback = Database['public']['Tables']['feedbacks']['Row'] & {
  author: UserProfile;
};
type Rapport = Database['public']['Tables']['rapports']['Row'];
type Saison = Database['public']['Tables']['saisons']['Row'];

interface ReportEditorProps {
  collaborator: UserProfile;
  saison: Saison;
  rapport: Rapport | null;
  feedbacks: Feedback[];
  onUpdate: () => void;
}

export function ReportEditor({ collaborator, saison, rapport, feedbacks, onUpdate }: ReportEditorProps) {
  const { profile } = useAuth();
  const [content, setContent] = useState(rapport?.content || '');
  const [status, setStatus] = useState<'DRAFT' | 'VALIDATED'>(rapport?.status || 'DRAFT');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (feedbacks.length === 0) {
      alert('Aucun feedback disponible pour générer le rapport');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!openaiApiKey) {
        throw new Error('Clé API OpenAI manquante. Veuillez configurer VITE_OPENAI_API_KEY dans votre fichier .env');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbacks: feedbacks.map(f => ({
            content: f.content,
            created_at: f.created_at,
            mission: f.mission,
            author: f.author,
          })),
          openaiApiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details
          ? `${errorData.error}\n\nDétails: ${errorData.details}\nStatus: ${errorData.status}`
          : errorData.error || 'Erreur lors de la génération du rapport';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setContent(data.report);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      if (rapport) {
        const { error: updateError } = await supabase
          .from('rapports')
          .update({
            content,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', rapport.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('rapports')
          .insert({
            collaborator_id: collaborator.id,
            author_id: profile.id,
            saison_id: saison.id,
            content,
            status,
          });

        if (insertError) throw insertError;
      }

      onUpdate();
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Erreur lors de la sauvegarde du rapport');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rapport) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('rapports')
        .delete()
        .eq('id', rapport.id);

      if (deleteError) throw deleteError;
      onUpdate();
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Erreur lors de la suppression du rapport');
    }
  };

  const canDelete = profile?.role === 'ADMIN' && rapport;

  const handleExportPDF = () => {
    if (!content) {
      alert('Le rapport est vide');
      return;
    }
    exportRapportToPDF(collaborator, saison, content, status);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Rapport d'évaluation annuelle
        </h2>
        <div className="flex items-center gap-2">
          {content && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en PDF</span>
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || feedbacks.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-fidu-700 hover:bg-fidu-800 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Générer par IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Contenu du rapport
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fidu-600 focus:border-transparent outline-none transition resize-none font-mono text-sm"
            placeholder="Le rapport généré par l'IA apparaîtra ici. Vous pourrez ensuite le modifier avant de le sauvegarder."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="DRAFT"
              checked={status === 'DRAFT'}
              onChange={(e) => setStatus(e.target.value as 'DRAFT')}
              className="w-4 h-4 text-fidu-600"
            />
            <span className="text-sm text-gray-700">Brouillon</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="VALIDATED"
              checked={status === 'VALIDATED'}
              onChange={(e) => setStatus(e.target.value as 'VALIDATED')}
              className="w-4 h-4 text-green-600"
            />
            <span className="text-sm text-gray-700">Validé</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || !content}
            className="flex items-center gap-2 px-6 py-2 bg-fidu-700 hover:bg-fidu-800 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : status === 'VALIDATED' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Valider et enregistrer</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer le brouillon</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!content && feedbacks.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">Aucun feedback disponible</p>
          <p className="text-sm">
            Ajoutez des feedbacks dans l'onglet "Feedbacks" pour pouvoir générer un rapport
          </p>
        </div>
      )}
    </div>
  );
}
