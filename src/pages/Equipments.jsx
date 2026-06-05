import { useCallback, useEffect, useState } from 'react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastContext';

import {
  createEquipmentForm,
  equipmentStatusOptions,
} from '../services/entityAdapters';

import {
  createEquipment,
  deleteEquipment,
  getEquipments,
  updateEquipment,
} from '../services/equipmentsService';

import { parseApiError } from '../services/apiUtils';

const initialPagination = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
};

function Equipments() {
  const { pushToast } = useToast();

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [equipments, setEquipments] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [form, setForm] = useState(createEquipmentForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getEquipmentId = (equipment) =>
    equipment?.id || equipment?.equipmentId || null;

  const loadEquipments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getEquipments({
        status,
        page,
        pageSize: 10,
      });

      setEquipments(response?.items || []);
      setPagination(response?.pagination || initialPagination);
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'Impossible de charger les équipements.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const resetModalState = () => {
    setModalOpen(false);
    setEditingEquipment(null);
    setForm(createEquipmentForm());
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
    setEditingEquipment(null);
    setForm(createEquipmentForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (equipment) => {
    setEditingEquipment(equipment);
    setForm(createEquipmentForm(equipment));
    setFormError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!String(form.name || '').trim()) {
      return "Le nom de l'équipement est obligatoire.";
    }

    if (!String(form.code || '').trim()) {
      return 'Le numéro de série est obligatoire.';
    }

    if (!String(form.location || '').trim()) {
      return 'La localisation est obligatoire.';
    }

    if (
      form.status === '' ||
      form.status === null ||
      form.status === undefined
    ) {
      return 'Le statut est obligatoire.';
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
      const equipmentId = getEquipmentId(editingEquipment);

      if (equipmentId) {
        await updateEquipment(equipmentId, form);

        pushToast({
          title: 'Équipement mis à jour',
          message: "Les informations de l'équipement ont été enregistrées avec succès.",
          tone: 'success',
        });
      } else {
        await createEquipment(form);

        pushToast({
          title: 'Équipement créé',
          message: 'Le nouvel équipement a été ajouté.',
          tone: 'success',
        });
      }

      resetModalState();
      await loadEquipments();
    } catch (apiError) {
      setFormError(
        parseApiError(
          apiError,
          "Échec de l'enregistrement de l'équipement."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const equipmentId = getEquipmentId(deleteTarget);

    if (!equipmentId) {
      return;
    }

    setDeleting(true);

    try {
      await deleteEquipment(equipmentId);

      pushToast({
        title: 'Équipement supprimé',
        message: 'La ligne a été supprimée du backend.',
        tone: 'success',
      });

      setDeleteTarget(null);
      await loadEquipments();
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
              Liste des équipements
            </h3>

            <p className="table-card__subtitle">
              Filtrage par statut, pagination et CRUD pour le parc technique.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            Nouvel équipement
          </button>
        </div>

        <div className="toolbar">
          <label className="filter-field">
            <span className="filter-label">Statut</span>

            <select
              className="select"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="">Tous</option>

              {equipmentStatusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
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
                Chargement des équipements
              </h3>

              <p className="app-loading__text">
                Lecture des équipements depuis le backend.
              </p>
            </div>
          </div>
        ) : equipments.length === 0 ? (
          <EmptyState
            title="Aucun équipement"
            text="Aucun équipement ne correspond au filtre sélectionné."
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Référence</th>
                    <th>Localisation</th>
                    <th>Statut</th>
                    <th>Maintenance</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {equipments.map((equipment, index) => {
                    const rowKey =
                      getEquipmentId(equipment) ||
                      equipment.code ||
                      index;

                    const currentStatus =
                      equipment.status ||
                      equipment.equipmentStatus ||
                      'Non renseigné';

                    return (
                      <tr key={rowKey}>
                        <td>
                          <p className="table-primary">
                            {equipment.name ||
                              equipment.designation ||
                              'Équipement'}
                          </p>

                          <p className="table-secondary">
                            Serial : {equipment.code || 'N/A'}
                          </p>
                        </td>

                        <td>
                          {equipment.code ||
                            equipment.reference ||
                            'N/A'}
                        </td>

                        <td>
                          {equipment.location ||
                            equipment.site ||
                            'N/A'}
                        </td>

                        <td>
                          <StatusBadge status={currentStatus} />
                        </td>

                        <td>
                          {equipment.lastMaintenanceDate ||
                            equipment.lastServiceDate ||
                            'N/A'}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() => openEditModal(equipment)}
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => setDeleteTarget(equipment)}
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
                setPage((current) => Math.max(1, current - 1))
              }
              onNext={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1)
                )
              }
            />
          </>
        )}
      </section>

      <Modal
        open={modalOpen}
        title={
          editingEquipment
            ? 'Modifier un équipement'
            : 'Créer un équipement'
        }
        description="Le formulaire envoie les données vers l'endpoint Equipments."
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
              ) : editingEquipment ? (
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
            <span className="filter-label">Nom</span>

            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">Numéro de série</span>

            <input
              className="input"
              name="code"
              value={form.code}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">Localisation</span>

            <input
              className="input"
              name="location"
              value={form.location}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">Statut</span>

            <select
              className="select"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              {equipmentStatusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
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
        title="Supprimer cet équipement ?"
        description={`L'équipement ${
          deleteTarget?.name || ''
        } sera supprimé du backend.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Supprimer"
      />
    </>
  );
}

export default Equipments;