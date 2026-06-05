import { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { getIntentDemandes } from '../services/intentService';

function Intent() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDemandes = async () => {
    setLoading(true);
    try {
      const data = await getIntentDemandes();
      setDemandes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemandes();
  }, []);

  if (loading) return <Spinner />;

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h2>Demandes Intent</h2>
          <p>Gestion des demandes d'intervention reçues depuis le module Intent.</p>
        </div>
      </div>

      {demandes.length === 0 ? (
        <EmptyState title="Aucune demande Intent disponible" />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Description</th>
                <th>Urgence</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.clientNom}</td>
                  <td>{demande.clientEmail}</td>
                  <td>{demande.descriptionPanne}</td>
                  <td>{demande.niveauUrgence}</td>
                  <td>{demande.statut}</td>
                  <td>{new Date(demande.dateCreationIntent).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Intent;