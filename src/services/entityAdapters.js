import {
  findFirstDefined,
  normalizeDateInput,
  normalizeText,
  removeEmptyValues,
} from './apiUtils';

export const userRoleOptions = [
  'Admin',
  'Manager',
  'Technician',
  'User',
];

export const equipmentStatusOptions = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
  { value: 2, label: 'Broken' },
];

export const taskStatusOptions = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Done' },
];

export const breakdownStatusOptions = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'Resolved' },
];

const statusLabelFromOptions = (options, value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const numericValue = Number(value);

  const option = options.find((entry) => entry.value === numericValue);

  if (option) {
    return option.label;
  }

  return normalizeText(value, fallback);
};

const formStatusValue = (options, value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const numericValue = Number(value);

  if (options.some((entry) => entry.value === numericValue)) {
    return numericValue;
  }

  const option = options.find(
    (entry) =>
      entry.label.toLowerCase() === String(value).toLowerCase()
  );

  return option ? option.value : fallback;
};

/* =========================
   USERS
========================= */

export const normalizeUser = (user = {}) => ({
  id: findFirstDefined(user, ['id', 'userId']),
  fullName: normalizeText(
    findFirstDefined(user, [
      'fullName',
      'name',
      'displayName',
      'userName',
    ]),
    'Utilisateur GMAO'
  ),
  userName: normalizeText(
    findFirstDefined(user, ['userName', 'username', 'login']),
    ''
  ),
  email: normalizeText(
    findFirstDefined(user, ['email', 'mail']),
    ''
  ),
  role: normalizeText(
    findFirstDefined(
      user,
      ['role', 'userRole'],
      Array.isArray(user.roles) ? user.roles[0] : ''
    ),
    'User'
  ),
  roles: Array.isArray(user.roles)
    ? user.roles
    : [
        normalizeText(
          findFirstDefined(user, ['role', 'userRole']),
          'User'
        ),
      ],
  createdAt: findFirstDefined(user, [
    'createdAt',
    'creationDate',
    'createdOn',
  ]),
  raw: user,
});

export const createUserForm = (user = {}) => ({
  fullName: user.fullName || '',
  email: user.email || '',
  role: user.role || 'User',
  password: '',
});

export const buildUserPayload = (
  form,
  { includePassword = true } = {}
) =>
  removeEmptyValues({
    fullName: form.fullName,
    name: form.fullName,
    email: form.email,
    role: form.role,
    passwordHash: includePassword ? form.password : undefined,
  });;

/* =========================
   EQUIPMENTS
========================= */

export const normalizeEquipment = (equipment = {}) => ({
  id: findFirstDefined(equipment, ['id', 'equipmentId']),
  name: normalizeText(
    findFirstDefined(equipment, ['name', 'designation', 'label']),
    'Équipement'
  ),
  code: normalizeText(
    findFirstDefined(equipment, [
      'serialNumber',
      'code',
      'reference',
    ]),
    ''
  ),
  type: normalizeText(
    findFirstDefined(equipment, ['type', 'category']),
    ''
  ),
  location: normalizeText(
    findFirstDefined(equipment, ['location', 'site', 'workshop']),
    ''
  ),
  status: statusLabelFromOptions(
    equipmentStatusOptions,
    findFirstDefined(equipment, ['status', 'equipmentStatus']),
    'Active'
  ),
  statusValue: formStatusValue(
    equipmentStatusOptions,
    findFirstDefined(equipment, ['status', 'equipmentStatus']),
    0
  ),
  lastMaintenanceDate: findFirstDefined(equipment, [
    'lastMaintenanceDate',
    'lastServiceDate',
    'maintenanceDate',
  ]),
  raw: equipment,
});

export const createEquipmentForm = (equipment = {}) => ({
  name: equipment.name || '',
  code: equipment.code || equipment.serialNumber || '',
  location: equipment.location || '',
  status: formStatusValue(
    equipmentStatusOptions,
    equipment.statusValue ?? equipment.status,
    0
  ),
  lastMaintenanceDate: normalizeDateInput(equipment.lastMaintenanceDate),
});

export const buildEquipmentPayload = (form) =>
  removeEmptyValues({
    name: form.name,
    serialNumber: form.code,
    location: form.location,
    status: Number(form.status),
  });

/* =========================
   TASKS
========================= */

export const normalizeTask = (task = {}) => ({
  id: findFirstDefined(task, ['id', 'taskId', 'maintenanceTaskId']),
  title: normalizeText(
    findFirstDefined(task, ['title', 'name']),
    'Tâche de maintenance'
  ),
  description: normalizeText(
    findFirstDefined(task, ['description', 'details']),
    ''
  ),
  equipmentId: findFirstDefined(task, ['equipmentId']),
  equipmentName: normalizeText(
    findFirstDefined(
      task,
      ['equipmentName', 'equipmentLabel'],
      task.equipment?.name
    ),
    ''
  ),
  assignedTo: findFirstDefined(task, ['assignedTo']),
  assignedToLabel: normalizeText(
    findFirstDefined(task, [
      'assignedUserName',
      'assignedUser',
      'technicianName',
    ]),
    ''
  ),
  status: statusLabelFromOptions(
    taskStatusOptions,
    findFirstDefined(task, ['status', 'taskStatus']),
    'Pending'
  ),
  statusValue: formStatusValue(
    taskStatusOptions,
    findFirstDefined(task, ['status', 'taskStatus']),
    0
  ),
  priority: normalizeText(findFirstDefined(task, ['priority']), 'Normal'),
  startDate: findFirstDefined(task, [
    'startDate',
    'plannedDate',
    'date',
    'scheduledDate',
    'createdAt',
  ]),
  endDate: findFirstDefined(task, ['endDate']),
  plannedDate: findFirstDefined(task, [
    'plannedDate',
    'startDate',
    'date',
    'scheduledDate',
    'createdAt',
  ]),
  raw: task,
});

export const createTaskForm = (task = {}) => ({
  title: task.title || '',
  description: task.description || '',
  equipmentId: task.equipmentId || '',
  assignedTo: task.assignedTo || '',
  status: formStatusValue(
    taskStatusOptions,
    task.statusValue ?? task.status,
    0
  ),
  priority: task.priority || 'Normal',
  startDate: normalizeDateInput(task.startDate || task.plannedDate),
  endDate: normalizeDateInput(task.endDate),
});

export const buildTaskPayload = (form) =>
  removeEmptyValues({
    title: form.title,
    description: form.description,
    equipmentId: form.equipmentId ? Number(form.equipmentId) : undefined,
    assignedTo: form.assignedTo ? Number(form.assignedTo) : undefined,
    status: Number(form.status),
    priority: form.priority,
    startDate: form.startDate
      ? new Date(form.startDate).toISOString()
      : undefined,
    endDate: form.endDate
      ? new Date(form.endDate).toISOString()
      : undefined,
  });

/* =========================
   BREAKDOWNS
========================= */

export const normalizeBreakdown = (breakdown = {}) => ({
  id: findFirstDefined(breakdown, ['id', 'breakdownId']),
  equipmentId: findFirstDefined(breakdown, ['equipmentId']),
  equipmentName: normalizeText(
    findFirstDefined(
      breakdown,
      ['equipmentName', 'equipmentLabel'],
      breakdown.equipment?.name
    ),
    'Équipement'
  ),
  reportedBy: findFirstDefined(breakdown, ['reportedBy']),
  reportedByName: normalizeText(
    findFirstDefined(breakdown, ['reportedByName']),
    ''
  ),
  description: normalizeText(
    findFirstDefined(breakdown, [
      'description',
      'title',
      'details',
    ]),
    ''
  ),
  priority: normalizeText(
    findFirstDefined(breakdown, ['priority', 'severity']),
    'N/A'
  ),
  status: statusLabelFromOptions(
    breakdownStatusOptions,
    findFirstDefined(breakdown, ['status', 'breakdownStatus']),
    'Pending'
  ),
  statusValue: formStatusValue(
    breakdownStatusOptions,
    findFirstDefined(breakdown, ['status', 'breakdownStatus']),
    0
  ),
  reportedAt: findFirstDefined(breakdown, [
    'reportedAt',
    'createdAt',
    'date',
  ]),
  raw: breakdown,
});

export const createBreakdownForm = (breakdown = {}) => ({
  equipmentId: breakdown.equipmentId || '',
  reportedBy: breakdown.reportedBy || '',
  equipmentName: breakdown.equipmentName || '',
  description: breakdown.description || '',
  status: formStatusValue(
    breakdownStatusOptions,
    breakdown.statusValue ?? breakdown.status,
    0
  ),
  reportedAt: normalizeDateInput(breakdown.reportedAt),
});

export const buildBreakdownPayload = (form) =>
  removeEmptyValues({
    equipmentId: form.equipmentId ? Number(form.equipmentId) : undefined,
    reportedBy: form.reportedBy ? Number(form.reportedBy) : undefined,
    description: form.description,
    status: Number(form.status),
    reportedAt: form.reportedAt
      ? new Date(form.reportedAt).toISOString()
      : undefined,
    date: form.reportedAt
      ? new Date(form.reportedAt).toISOString()
      : undefined,
  });