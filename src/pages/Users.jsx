import {
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { useToast } from '../components/ToastContext';

import {
  createUserForm,
  userRoleOptions,
} from '../services/entityAdapters';

import { parseApiError } from '../services/apiUtils';

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../services/usersService';

const initialPagination = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
};

function Users() {
  const { pushToast } = useToast();

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(createUserForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getUserId = (user) => {
    return user?.id || user?.userId || null;
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUsers({
        search: deferredSearch,
        page,
        pageSize: 10,
      });

      setUsers(response?.items || []);
      setPagination(response?.pagination || initialPagination);
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'Impossible de charger les utilisateurs.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [deferredSearch, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const resetModalState = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(createUserForm());
    setFormError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(createUserForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
  setEditingUser(user);

  setForm({
    ...createUserForm(user),
    password: '',
  });

  setFormError('');
  setModalOpen(true);
};

  const validateForm = () => {
  if (!String(form.fullName || '').trim()) {
    return 'Le nom complet est obligatoire.';
  }

  if (!String(form.email || '').trim()) {
    return "L'adresse e-mail est obligatoire.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(form.email)) {
    return 'Adresse e-mail invalide.';
  }

  if (!editingUser && !String(form.password || '').trim()) {
    return 'Le mot de passe est obligatoire pour créer un utilisateur.';
  }

  if (form.password && form.password.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }

  return '';
};

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const userId = getUserId(editingUser);

      if (userId) {
        await updateUser(userId, form);

        pushToast({
          title: 'Utilisateur mis à jour',
          message:
            'Les informations ont été synchronisées avec le backend.',
          tone: 'success',
        });
      } else {
        await createUser(form);

        pushToast({
          title: 'Utilisateur créé',
          message:
            'Le nouvel utilisateur a été ajouté avec succès.',
          tone: 'success',
        });
      }

      resetModalState();
      await loadUsers();
    } catch (apiError) {
      setFormError(
        parseApiError(
          apiError,
          "Échec de l'enregistrement de l'utilisateur."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const userId = getUserId(deleteTarget);

    if (!userId) {
      return;
    }

    setDeleting(true);

    try {
      await deleteUser(userId);

      pushToast({
        title: 'Utilisateur supprimé',
        message: "Le compte a été retiré de l'interface.",
        tone: 'success',
      });

      setDeleteTarget(null);
      await loadUsers();
    } catch (apiError) {
      pushToast({
        title: 'Suppression impossible',
        message: parseApiError(
          apiError,
          'Le backend a refusé la suppression.'
        ),
        tone: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="table-card">
        <div className="table-card__header">
          <div>
            <h3 className="table-card__title">
              Liste des utilisateurs
            </h3>

            <p className="table-secondary">
              {pagination.totalCount} utilisateur(s)
            </p>

            <p className="table-card__subtitle">
              Gestion des utilisateurs du système de maintenance.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            Nouvel utilisateur
          </button>
        </div>

        <div className="toolbar">
          <label className="filter-field">
            <span className="filter-label">
              Recherche
            </span>

            <input
              className="input"
              value={search}
              onChange={handleSearchChange}
              placeholder="Rechercher un utilisateur..."
            />
          </label>
        </div>

        {error ? (
          <div className="alert alert--error">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="app-loading">
            <div className="app-loading__panel">
              <h3 className="app-loading__title">
                Chargement des utilisateurs
              </h3>

              <p className="app-loading__text">
                Récupération des données avec filtre et pagination.
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Aucun utilisateur"
            text="Aucun résultat ne correspond au filtre courant."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => {
                    const rowKey =
                      getUserId(user) || user.email || index;

                    const roles = Array.isArray(user.roles)
                      ? user.roles.join(', ')
                      : user.role || 'N/A';

                    const createdDate =
                      user.createdAt || user.creationDate;

                    return (
                      <tr key={rowKey}>
                        <td>
                          <p className="table-primary">
                            {user.fullName ||
                              user.name ||
                              user.userName ||
                              'Utilisateur'}
                          </p>

                          <p className="table-secondary">
                            Username:{' '}
                            {user.userName ||
                              user.username ||
                              'N/A'}
                          </p>
                        </td>

                        <td>{user.email || 'N/A'}</td>

                        <td>{roles}</td>

                        <td>
                          {createdDate
                            ? new Date(
                                createdDate
                              ).toLocaleDateString('fr-FR')
                            : 'Non disponible'}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() =>
                                openEditModal(user)
                              }
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              disabled={deleting}
                              onClick={() =>
                                setDeleteTarget(user)
                              }
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              pageNumber={pagination.pageNumber}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPrevious={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              onNext={() =>
                setPage((current) =>
                  Math.min(
                    pagination.totalPages,
                    current + 1
                  )
                )
              }
            />
          </>
        )}
      </section>

      <Modal
        open={modalOpen}
        title={
          editingUser
            ? 'Modifier un utilisateur'
            : 'Créer un utilisateur'
        }
        description="Le formulaire envoie directement les changements vers l'API Users."
        onClose={resetModalState}
        footer={
          <>
            <button
              type="button"
              className="ghost-button"
              onClick={resetModalState}
              disabled={saving}
            >
              Annuler
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Spinner label="Enregistrement" />
              ) : editingUser ? (
                'Enregistrer'
              ) : (
                'Créer'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid form-grid--2">
          <label className="filter-field">
            <span className="filter-label">
              Nom complet
            </span>

            <input
              className="input"
              name="fullName"
              value={form.fullName}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Email
            </span>

            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Rôle
            </span>

            <select
              className="select"
              name="role"
              value={form.role}
              onChange={handleFormChange}
            >
              {userRoleOptions.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field form-grid__full">
            <span className="filter-label">
              Mot de passe{' '}
              {editingUser
                ? '(laisser vide pour ne pas changer)'
                : ''}
            </span>

            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
            />
          </label>
        </div>

        {formError ? (
          <div className="alert alert--error">
            {formError}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cet utilisateur ?"
        description={`Le compte ${
          deleteTarget?.fullName ||
          deleteTarget?.userName ||
          ''
        } sera retiré du backend si l'endpoint DELETE est disponible.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Supprimer"
      />
    </>
  );
}

export default Users;