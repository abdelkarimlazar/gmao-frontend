import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', tag: 'DB' },
  { to: '/users', label: 'Utilisateurs', tag: 'US' },
  { to: '/equipments', label: 'Équipements', tag: 'EQ' },
  { to: '/tasks', label: 'Tâches', tag: 'TK' },
  { to: '/breakdowns', label: 'Pannes', tag: 'BD' },
  { to: '/notifications', label: 'Notifications', tag: 'NT' },
  { to: '/intent', label: 'Intent', tag: 'IN' },
];

function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__eyebrow">
          PFE Full Stack
        </span>

        <h1 className="sidebar__title">
          GMAO Admin
        </h1>

        <p className="sidebar__subtitle">
          Supervision des utilisateurs, équipements, interventions et pannes depuis une seule interface React.
        </p>
      </div>

      <nav
        className="sidebar__nav"
        aria-label="Navigation principale"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            onClick={onNavigate}
          >
            <span className="sidebar__icon">
              {item.tag}
            </span>

            <span>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <strong>Architecture propre</strong>
        <p>
          Context API, routes protégées, Axios centralisé, composants maintenables et design responsive.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;