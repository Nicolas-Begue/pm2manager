'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const res = await fetch('/api/pm2/list');
      if (!res.ok) throw new Error('Erreur lors de la récupération des processus');
      const data = await res.json();
      setProcesses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, processId) => {
    try {
      const res = await fetch(`/api/pm2/${action}/${processId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Erreur lors de l'action ${action}`);
      fetchProcesses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestionnaire PM2</h1>
          <button onClick={handleLogout} className="btn btn-ghost">
            Déconnexion
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Statut</th>
                <th>CPU</th>
                <th>Mémoire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.pm_id}>
                  <td>{process.pm_id}</td>
                  <td>{process.name}</td>
                  <td>
                    <span className={`badge ${process.status === 'online' ? 'badge-success' : 'badge-error'}`}>
                      {process.status}
                    </span>
                  </td>
                  <td>{process.monit.cpu}%</td>
                  <td>{Math.round(process.monit.memory / 1024 / 1024)}MB</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction('restart', process.pm_id)}
                        className="btn btn-sm btn-warning"
                      >
                        Redémarrer
                      </button>
                      <button
                        onClick={() => handleAction('stop', process.pm_id)}
                        className="btn btn-sm btn-error"
                      >
                        Arrêter
                      </button>
                      <button
                        onClick={() => handleAction('logs', process.pm_id)}
                        className="btn btn-sm btn-info"
                      >
                        Logs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 