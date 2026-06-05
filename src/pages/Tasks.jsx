import { useCallback, useEffect, useState } from 'react';

import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastContext';

import {
  createTaskForm,
  taskStatusOptions,
} from '../services/entityAdapters';

import {
  formatDateLabel,
  parseApiError,
} from '../services/apiUtils';

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../services/tasksService';

function Tasks() {
  const { pushToast } = useToast();

  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(createTaskForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getTaskId = (task) => {
    return task?.id || task?.taskId || null;
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getTasks({
        status,
        startDate,
        endDate,
      });

      setTasks(
        Array.isArray(response)
          ? response
          : response?.items || []
      );
    } catch (apiError) {
      setError(
        parseApiError(
          apiError,
          'Impossible de charger les tâches.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, status]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const resetModalState = () => {
    setModalOpen(false);
    setEditingTask(null);
    setForm(createTaskForm());
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
    setEditingTask(null);
    setForm(createTaskForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm(createTaskForm(task));
    setFormError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!String(form.title || '').trim()) {
      return 'Le titre de la tâche est obligatoire.';
    }

    if (!String(form.description || '').trim()) {
      return 'La description de la tâche est obligatoire.';
    }

    if (!String(form.priority || '').trim()) {
      return 'La priorité de la tâche est obligatoire.';
    }

    if (
      form.status === '' ||
      form.status === null ||
      form.status === undefined
    ) {
      return 'Le statut de la tâche est obligatoire.';
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
      const taskId = getTaskId(editingTask);

      if (taskId) {
        await updateTask(taskId, form);

        pushToast({
          title: 'Tâche mise à jour',
          message:
            'La tâche a été synchronisée avec le backend.',
          tone: 'success',
        });
      } else {
        await createTask(form);

        pushToast({
          title: 'Tâche créée',
          message:
            'La nouvelle tâche a été enregistrée.',
          tone: 'success',
        });
      }

      resetModalState();
      await loadTasks();
    } catch (apiError) {
      setFormError(
        parseApiError(
          apiError,
          "Échec de l'enregistrement de la tâche."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const taskId = getTaskId(deleteTarget);

    if (!taskId) {
      return;
    }

    setDeleting(true);

    try {
      await deleteTask(taskId);

      pushToast({
        title: 'Tâche supprimée',
        message: 'La tâche a été retirée de la liste.',
        tone: 'success',
      });

      setDeleteTarget(null);
      await loadTasks();
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
              Tâches de maintenance
            </h3>

            <p className="table-card__subtitle">
              Filtrage par statut, dates et opérations CRUD sur l'endpoint MaintenanceTasks.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            Nouvelle tâche
          </button>
        </div>

        <div className="toolbar">
          <label className="filter-field">
            <span className="filter-label">
              Statut
            </span>

            <select
              className="select"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="">Tous</option>

              {taskStatusOptions.map((option) => (
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
              Date début
            </span>

            <input
              className="input"
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(event.target.value)
              }
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Date fin
            </span>

            <input
              className="input"
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(event.target.value)
              }
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
                Chargement des tâches
              </h3>

              <p className="app-loading__text">
                Lecture des tâches avec filtres de statut et dates.
              </p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Aucune tâche"
            text="Aucune tâche ne correspond aux filtres saisis."
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tâche</th>
                  <th>Équipement</th>
                  <th>Assigné à</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task, index) => {
                  const rowKey =
                    getTaskId(task) || index;

                  const currentStatus =
                    task.status ||
                    task.taskStatus ||
                    'Non renseigné';

                  return (
                    <tr key={rowKey}>
                      <td>
                        <p className="table-primary">
                          {task.title ||
                            task.name ||
                            'Tâche de maintenance'}
                        </p>

                        <p className="table-secondary">
                          {task.description ||
                            'Aucune description fournie.'}
                        </p>
                      </td>

                      <td>
                        {task.equipmentName ||
                          task.equipment?.name ||
                          'N/A'}
                      </td>

                      <td>
                        {task.assignedToLabel ||
                          task.assignedTo ||
                          'N/A'}
                      </td>

                      <td>
                        <StatusBadge status={currentStatus} />
                      </td>

                      <td>
                        {formatDateLabel(
                          task.startDate ||
                            task.plannedDate ||
                            task.createdAt
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() =>
                              openEditModal(task)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              setDeleteTarget(task)
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
          editingTask
            ? 'Modifier une tâche'
            : 'Créer une tâche'
        }
        description="Les données sont envoyées vers l'endpoint MaintenanceTasks avec un payload compatible avec les DTO proches."
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
              ) : editingTask ? (
                'Enregistrer'
              ) : (
                'Créer'
              )}
            </button>
          </>
        }
      >
        <div className="form-grid form-grid--2">
          <label className="filter-field form-grid__full">
            <span className="filter-label">
              Titre
            </span>

            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleFormChange}
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
              Assigned user ID
            </span>

            <input
              className="input"
              type="number"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleFormChange}
              min="1"
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
              {taskStatusOptions.map((option) => (
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
              Priorité
            </span>

            <input
              className="input"
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              placeholder="Normal"
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Date début
            </span>

            <input
              className="input"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleFormChange}
            />
          </label>

          <label className="filter-field">
            <span className="filter-label">
              Date fin
            </span>

            <input
              className="input"
              type="date"
              name="endDate"
              value={form.endDate}
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
        title="Supprimer cette tâche ?"
        description={`La tâche ${
          deleteTarget?.title || ''
        } sera retirée si l'endpoint DELETE MaintenanceTasks est disponible.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Supprimer"
      />
    </>
  );
}

export default Tasks;