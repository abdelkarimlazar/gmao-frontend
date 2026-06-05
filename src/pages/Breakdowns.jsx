import { useEffect, useMemo, useState } from 'react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastContext';
import {
  breakdownStatusOptions,
  createBreakdownForm,
} from '../services/entityAdapters';
import {
  createBreakdown,
  deleteBreakdown,
  getBreakdowns,
  updateBreakdown,
  updateBreakdownStatus,
} from '../services/breakdownsService';
import {
  formatDateLabel,
  parseApiError,
} from '../services/apiUtils';

function Breakdowns() {
  const { pushToast } = useToast();

  const [breakdowns, setBreakdowns] = useState([]);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBreakdown, setEditingBreakdown] = useState(null);
  const [form, setForm] = useState(createBreakdownForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const statusOptions = useMemo(() => breakdownStatusOptions, []);

  const getBreakdownId = (breakdown) => {
    return breakdown?.id || breakdown?.breakdownId || null;
  };

  const reloadBreakdowns = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getBreakdowns();
      setBreakdowns(Array.isArray(response) ? response : []);
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'Impossible de charger les pannes.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadBreakdowns();
  }, []);

  const resetModalState = () => {
    setModalOpen(false);
    setEditingBreakdown(null);
    setForm(createBreakdownForm());
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
    setEditingBreakdown(null);
    setForm(createBreakdownForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (breakdown) => {
    setEditingBreakdown(breakdown);
    setForm(createBreakdownForm(breakdown));
    setFormError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!String(form.description || '').trim()) {
      return 'La description de la panne est obligatoire.';
    }

    return '';
  };

  const handleDraftChange = (breakdownId, value) => {
    setStatusDrafts((current) => ({
      ...current,
      [breakdownId]: value,
    }));
  };

  const handleSaveStatus = async (breakdown) => {
    const breakdownId = getBreakdownId(breakdown);

    if (!breakdownId) {
      setError('Identifiant de panne introuvable.');
      return;
    }

    const nextStatus = Number(
      statusDrafts[breakdownId] ??
        breakdown.statusValue ??
        breakdown.status ??
        0
    );

    setSavingId(breakdownId);
    setError('');

    try {
      await updateBreakdownStatus(breakdown, nextStatus);

      setBreakdowns((current) =>
        current.map((item) => {
          const itemId = getBreakdownId(item);

          const nextStatusLabel =
            statusOptions.find(
              (option) => Number(option.value) === nextStatus
            )?.label || nextStatus;

          return itemId === breakdownId
            ? {
              ...item,
              statusValue: nextStatus,
              status: nextStatusLabel,
            }
          : item;
        })
      );

      pushToast({
        title: 'Statut mis à jour',
        message: 'La panne a bien changé de statut.',
        tone: 'success',
      });
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'La mise à jour du statut a échoué.'
        )
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleModalSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const breakdownId = getBreakdownId(editingBreakdown);

      if (breakdownId) {
        await updateBreakdown(breakdownId, form);

        pushToast({
          title: 'Panne mise à jour',
          message: 'Les informations ont été mises à jour.',
          tone: 'success',
        });
      } else {
        await createBreakdown(form);

        pushToast({
          title: 'Panne créée',
          message: 'La panne a été ajoutée avec succès.',
          tone: 'success',
        });
      }

      resetModalState();
      await reloadBreakdowns();
    } catch (apiError) {
      setFormError(
        parseApiError(
          apiError,
          "Échec de l'enregistrement de la panne."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const breakdownId = getBreakdownId(deleteTarget);

    if (!breakdownId) {
      return;
    }

    setDeleting(true);

    try {
      await deleteBreakdown(breakdownId);

      pushToast({
        title: 'Panne supprimée',
        message: 'La panne a été retirée du backend.',
        tone: 'success',
      });

      setDeleteTarget(null);
      await reloadBreakdowns();
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
              Pannes
            </h3>

            <p className="table-card__subtitle">
              Liste des pannes, mise à jour du statut et CRUD complet depuis React.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            Nouvelle panne
          </button>
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
                Chargement des pannes
              </h3>

              <p className="app-loading__text">
                Récupération de la liste et préparation des actions de mise à jour.
              </p>
            </div>
          </div>
        ) : breakdowns.length === 0 ? (
          <EmptyState
            title="Aucune panne"
            text="Aucune panne ouverte ou historisée n'est remontée par l'API."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Description</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Mise à jour</th>
                  <th>CRUD</th>
                </tr>
              </thead>

              <tbody>
                {breakdowns.map((breakdown, index) => {
                  const breakdownId =
                    getBreakdownId(breakdown) || index;

                  const currentStatus =
                    breakdown.status ||
                    breakdown.statusLabel ||
                    'Open';

                  return (
                    <tr key={breakdownId}>
                      <td>
                        <p className="table-primary">
                          {breakdown.equipmentName ||
                            breakdown.equipment?.name ||
                            'Équipement'}
                        </p>

                        <p className="table-secondary">
                          Signalé le :{' '}
                          {formatDateLabel(
                            breakdown.reportedAt ||
                              breakdown.createdAt
                          )}
                        </p>
                      </td>

                      <td>
                        {breakdown.description ||
                          breakdown.title ||
                          'Aucune description'}
                      </td>

                      <td>
                        {breakdown.priority || 'N/A'}
                      </td>

                      <td>
                        <StatusBadge status={currentStatus} />
                      </td>

                      <td>
                        <div className="status-editor">
                          <select
                            className="select"
                            value={
                              statusDrafts[breakdownId] ??
                              breakdown.statusValue ??
                              0
                            }
                            onChange={(event) =>
                              handleDraftChange(
                                breakdownId,
                                event.target.value
                              )
                            }
                          >
                            {statusOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="status-action"
                            onClick={() =>
                              handleSaveStatus(breakdown)
                            }
                            disabled={savingId === breakdownId}
                          >
                            {savingId === breakdownId
                              ? 'Maj...'
                              : 'Mettre à jour'}
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() =>
                              openEditModal(breakdown)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              setDeleteTarget(breakdown)
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
        )}
      </section>

      <Modal
        open={modalOpen}
        title={
          editingBreakdown
            ? 'Modifier une panne'
            : 'Créer une panne'
        }
        description="Le formulaire émet un payload compatible avec les contrats de pannes côté ASP.NET Core."
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
              onClick={handleModalSave}
              disabled={saving}
            >
              {saving ? (
                <Spinner label="Enregistrement" />
              ) : editingBreakdown ? (
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
              Equipment ID
            </span>

            <input
              className="input"
              type="number"
              name="equipmentId"
              value={form.equipmentId}
              onChange={handleFormChange}
              min="1"
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Reported by user ID
            </span>

            <input
              className="input"
              type="number"
              name="reportedBy"
              value={form.reportedBy}
              onChange={handleFormChange}
              min="1"
            />
          </label>

          <label className="filter-field form-grid__full">
            <span className="filter-label">
              Description
            </span>

            <textarea
              className="input textarea"
              name="description"
              value={form.description}
              onChange={handleFormChange}
              rows="4"
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Statut
            </span>

            <select
              className="select"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              {breakdownStatusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Date de signalement
            </span>

            <input
              className="input"
              type="date"
              name="reportedAt"
              value={form.reportedAt}
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
        title="Supprimer cette panne ?"
        description={`La panne ${
          deleteTarget?.description || ''
        } sera retirée si l'endpoint DELETE Breakdowns est disponible.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Supprimer"
      />
    </>
  );
}

export default Breakdowns;