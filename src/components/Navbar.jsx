import { useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const pageMeta = {
  '/dashboard': {
    kicker: 'Pilotage global',
    title: "Vue d'ensemble des indicateurs GMAO",
    subtitle:
      'Suivi en temps réel des KPI exposés par votre API Dashboard.',
  },
  '/users': {
    kicker: 'Administration',
    title: 'Gestion des utilisateurs',
    subtitle:
      'Recherche, pagination et lecture rapide des comptes applicatifs.',
  },
  '/equipments': {
    kicker: 'Parc technique',
    title: 'Gestion des équipements',
    subtitle:
      'Filtrage des actifs selon leur statut de fonctionnement.',
  },
  '/tasks': {
    kicker: 'Maintenance',
    title: 'Suivi des tâches',
    subtitle:
      "Contrôle du planning et des statuts d'intervention.",
  },
  '/breakdowns': {
    kicker: 'Incidents',
    title: 'Gestion des pannes',
    subtitle:
      'Mise à jour rapide des pannes et de leur progression.',
  },
};

function Navbar({ onOpenSidebar }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage =
    pageMeta[location.pathname] || pageMeta['/dashboard'];

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'GA';

  return (
    <header className="navbar">
      <div className="navbar__intro">
        <button
          type="button"
          className="navbar__menu"
          onClick={onOpenSidebar}
        >
          Menu
        </button>

        <div>
          <p className="navbar__kicker">
            {currentPage.kicker}
          </p>

          <h2 className="page-title">
            {currentPage.title}
          </h2>

          <p className="page-subtitle">
            {currentPage.subtitle}
          </p>
        </div>
      </div>

      <div className="navbar__profile">
        <div className="profile-card">
          <span className="profile-card__avatar">
            {initials}
          </span>

          <div>
            <p className="profile-card__name">
              {user?.name || 'Utilisateur GMAO'}
            </p>

            <p className="profile-card__role">
              {user?.role || 'Administrateur'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={logout}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

export default Navbar;