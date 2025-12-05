import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { CollaboratorDetail } from './components/CollaboratorDetail';
import type { Database } from './lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

function App() {
  const { user, profile, loading } = useAuth();
  const [selectedCollaborator, setSelectedCollaborator] = useState<UserProfile | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  if (selectedCollaborator) {
    return (
      <CollaboratorDetail
        collaborator={selectedCollaborator}
        onBack={() => setSelectedCollaborator(null)}
      />
    );
  }

  return <Dashboard onSelectCollaborator={setSelectedCollaborator} />;
}

export default App;
