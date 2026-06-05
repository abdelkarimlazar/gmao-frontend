import { useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Spinner from '../components/Spinner';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/apiUtils';

const initialForm = {
  username: '',
  password: '',
};

function Login() {
  const { isAuthenticated, login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login({
        username: form.username.trim(),
        password: form.password,
      });

      pushToast({
        title: 'Connexion réussie',
        message: 'Bienvenue dans votre espace GMAO.',
        tone: 'success',
      });

      const destination =
        location.state?.from?.pathname || '/dashboard';

      navigate(destination, {
        replace: true,
      });
    } catch (apiError) {
      const message = parseApiError(
        apiError,
        'Connexion impossible. Vérifiez vos informations.'
      );

      setError(message);

      pushToast({
        title: 'Connexion impossible',
        message,
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-hero__content">
          <span className="auth-hero__eyebrow">
            React x ASP.NET Core
          </span>

          <h1 className="auth-hero__title">
            Pilotez votre GMAO avec une interface claire et professionnelle.
          </h1>

          <p className="auth-hero__text">
            Connectez-vous pour superviser le dashboard, les équipements,
            les tâches de maintenance et les pannes en temps réel.
          </p>
        </div>

        <div className="auth-hero__stats">
          <div className="auth-hero__stat">
            <p>JWT</p>
            <h3>Session sécurisée</h3>
          </div>

          <div className="auth-hero__stat">
            <p>API</p>
            <h3>Base URL centralisée</h3>
          </div>

          <div className="auth-hero__stat">
            <p>UI</p>
            <h3>Responsive admin</h3>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <h2 className="auth-card__title">
          Connexion
        </h2>

        <p className="auth-card__subtitle">
          Authentification JWT avec conservation du token dans localStorage.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label className="filter-field">
            <span className="filter-label">
              Nom d'utilisateur
            </span>

            <input
              className="input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Mot de passe
            </span>

            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="alert alert--error">
              {error}
            </div>
          ) : null}

          <div className="auth-form__actions">
            <span className="helper-text">
              Le header Authorization est ajouté automatiquement à chaque requête.
            </span>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <Spinner label="Connexion" />
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>

        <p className="auth-card__switch">
          Pas encore de compte ?{' '}
          <Link to="/register">
            Créer un compte
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Login;