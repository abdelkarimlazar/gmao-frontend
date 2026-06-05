import { useCallback, useEffect, useMemo, useState } from 'react';

import DashboardChart from '../components/DashboardChart';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

import { getDashboardSummary } from '../services/dashboardService';
import { parseApiError } from '../services/apiUtils';

const defaultStats = {
  totalUsers: 0,
  totalEquipments: 0,
  brokenEquipments: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  openBreakdowns: 0,
};

const metricCards = [
  {
    key: 'totalUsers',
    label: 'Utilisateurs',
    accent: 'Gestion des accès',
  },
  {
    key: 'totalEquipments',
    label: 'Équipements',
    accent: 'Parc total',
  },
  {
    key: 'brokenEquipments',
    label: 'Équipements HS',
    accent: 'À surveiller',
  },
  {
    key: 'pendingTasks',
    label: 'Tâches en attente',
    accent: 'Backlog actuel',
  },
  {
    key: 'inProgressTasks',
    label: 'Tâches en cours',
    accent: 'Interventions ouvertes',
  },
  {
    key: 'completedTasks',
    label: 'Tâches terminées',
    accent: 'Exécution livrée',
  },
  {
    key: 'openBreakdowns',
    label: 'Pannes ouvertes',
    accent: 'Incidents actifs',
  },
];

function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getDashboardSummary();

      setStats({
        ...defaultStats,
        ...response,
      });

      setLastRefresh(new Date());
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'Impossible de charger le dashboard.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const chartItems = useMemo(
    () => [
      {
        label: 'Utilisateurs',
        value: stats.totalUsers,
      },
      {
        label: 'Équipements',
        value: stats.totalEquipments,
      },
      {
        label: 'Pannes ouvertes',
        value: stats.openBreakdowns,
      },
      {
        label: 'Tâches en cours',
        value: stats.inProgressTasks,
      },
      {
        label: 'Tâches terminées',
        value: stats.completedTasks,
      },
    ],
    [stats]
  );

  const taskCompletionRate = useMemo(() => {
    const totalTasks =
      stats.pendingTasks +
      stats.inProgressTasks +
      stats.completedTasks;

    return totalTasks > 0
      ? Math.round(
          (stats.completedTasks / totalTasks) *
            100
        )
      : 0;
  }, [stats]);

  const equipmentAvailabilityRate =
    useMemo(() => {
      if (!stats.totalEquipments) {
        return 100;
      }

      return Math.max(
        0,
        100 -
          Math.round(
            (stats.brokenEquipments /
              stats.totalEquipments) *
              100
          )
      );
    }, [stats]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__panel">
          <h3 className="app-loading__title">
            Chargement du dashboard
          </h3>

          <p className="app-loading__text">
            Récupération des indicateurs
            de maintenance.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Dashboard indisponible"
        text={error}
      />
    );
  }

  return (
    <div className="page-grid">
      <section className="page-grid page-grid--metrics">
        {metricCards.map((card) => (
          <article
            key={card.key}
            className="metric-card"
          >
            <p className="metric-card__label">
              {card.label}
            </p>

            <p className="metric-card__value">
              {stats[card.key] ?? 0}
            </p>

            <span className="metric-card__accent">
              {card.accent}
            </span>
          </article>
        ))}
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h3 className="section-card__title">
              Lecture métier rapide
            </h3>

            <p className="section-card__text">
              Vue synthétique des
              performances de maintenance.
            </p>
          </div>

          <button
            type="button"
            className="ghost-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? (
              <Spinner label="Actualisation" />
            ) : (
              'Actualiser'
            )}
          </button>
        </div>

        {lastRefresh && (
          <p className="table-secondary">
            Dernière mise à jour :
            {' '}
            {lastRefresh.toLocaleString()}
          </p>
        )}

        <div className="insight-grid">
          <div className="insight-item">
            <p className="metric-card__label">
              Charge maintenance
            </p>

            <p className="insight-item__value">
              {stats.pendingTasks +
                stats.inProgressTasks}
            </p>

            <p className="table-secondary">
              Somme des interventions non clôturées.
            </p>
          </div>

          <div className="insight-item">
            <p className="metric-card__label">
              Taux de pannes ouvertes
            </p>

            <p className="insight-item__value">
              {stats.totalEquipments
                ? `${Math.round(
                    (stats.openBreakdowns /
                      stats.totalEquipments) *
                      100
                  )}%`
                : '0%'}
            </p>

            <p className="table-secondary">
              Rapport entre les pannes ouvertes
              et le nombre total d'équipements.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-split">
        <article className="section-card">
          <div className="section-card__header">
            <div>
              <h3 className="section-card__title">
                Activité backend agrégée
              </h3>

              <p className="section-card__text">
                Visualisation des principaux
                indicateurs opérationnels.
              </p>
            </div>
          </div>

          <DashboardChart
            items={chartItems}
          />
        </article>

        <article className="section-card">
          <div className="section-card__header">
            <div>
              <h3 className="section-card__title">
                Santé opérationnelle
              </h3>

              <p className="section-card__text">
                État actuel de la maintenance
                et de la disponibilité des équipements.
              </p>
            </div>
          </div>

          <div className="health-grid">
            <div className="health-card">
              <p className="health-card__label">
                Disponibilité équipements
              </p>

              <p className="health-card__value">
                {equipmentAvailabilityRate}%
              </p>

              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{
                    width: `${equipmentAvailabilityRate}%`,
                  }}
                />
              </div>
            </div>

            <div className="health-card">
              <p className="health-card__label">
                Complétion des tâches
              </p>

              <p className="health-card__value">
                {taskCompletionRate}%
              </p>

              <div className="progress-track">
                <div
                  className="progress-bar progress-bar--accent"
                  style={{
                    width: `${taskCompletionRate}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;