import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Spinner from '../components/Spinner';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/apiUtils';

const initialForm = {
  name: '',
  email: '',
  role: 'Admin',
  password: '',
  confirmPassword: '',
};

function Register() {
  const { isAuthenticated, register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const validateForm = () => {
    if (!form.name.trim()) {
      return 'Le nom complet est obligatoire.';
    }

    if (!form.email.trim()) {
      return "L'adresse e-mail est obligatoire.";
    }

    if (form.password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (form.password !== form.confirmPassword) {
      return 'Les mots de passe ne correspondent pas.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await register({
        fullName: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      });

      if (result?.autoLoggedIn) {
        pushToast({
          title: 'Inscription réussie',
          message:
            'Le compte a été créé et la session a été ouverte.',
          tone: 'success',
        });

        navigate('/dashboard', {
          replace: true,
        });

        return;
      }

      setSuccess(
        'Compte créé avec succès. Vous pouvez maintenant vous connecter.'
      );

      pushToast({
        title: 'Compte créé',
        message:
          'Vous pouvez maintenant vous connecter.',
        tone: 'success',
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
        });
      }, 1000);
    } catch (apiError) {
      const message = parseApiError(
        apiError,
        'Inscription impossible.'
      );

      setError(message);

      pushToast({
        title: 'Inscription impossible',
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
            Onboarding
          </span>

          <h1 className="auth-hero__title">
            Préparez votre espace de maintenance dès la première connexion.
          </h1>

          <p className="auth-hero__text">
            Créez rapidement un compte pour accéder au portail
            d'administration React et commencer la démonstration
            full stack de votre projet GMAO.
          </p>
        </div>

        <div className="auth-hero__stats">
          <div className="auth-hero__stat">
            <p>Comptes</p>
            <h3>Register API</h3>
          </div>

          <div className="auth-hero__stat">
            <p>Rôles</p>
            <h3>JWT sécurisé</h3>
          </div>

          <div className="auth-hero__stat">
            <p>Routes</p>
            <h3>Protection globale</h3>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <h2 className="auth-card__title">
          Inscription
        </h2>

        <p className="auth-card__subtitle">
          Le formulaire envoie vos données au backend via Axios.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="auth-form__grid">
            <label className="filter-field">
              <span className="filter-label">
                Nom complet
              </span>

              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Administrateur GMAO"
                required
              />
            </label>

            <label className="filter-field">
              <span className="filter-label">
                Adresse e-mail
              </span>

              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@gmao.local"
                required
              />
            </label>
          </div>

          <label className="filter-field">
            <span className="filter-label">
              Rôle
            </span>

            <select
              className="select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="Admin">
                Admin
              </option>

              <option value="Manager">
                Manager
              </option>

              <option value="Technician">
                Technician
              </option>

              <option value="User">
                User
              </option>
            </select>
          </label>

          <div className="auth-form__grid">
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
                required
              />
            </label>

            <label className="filter-field">
              <span className="filter-label">
                Confirmation
              </span>

              <input
                className="input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required
              />
            </label>
          </div>

          {error && (
            <div className="alert alert--error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert--success">
              {success}
            </div>
          )}

          <div className="auth-form__actions">
            <span className="helper-text">
              Le formulaire gère également le cas où le backend
              retourne directement un token JWT après inscription.
            </span>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <Spinner label="Création" />
              ) : (
                'Créer le compte'
              )}
            </button>
          </div>
        </form>

        <p className="auth-card__switch">
          Déjà inscrit ?{' '}
          <Link to="/login">
            Revenir à la connexion
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Register;