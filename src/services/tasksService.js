import api from '../api/axiosConfig';

import {
  buildQueryParams,
  extractCollection,
  extractEntity,
  tryRequest,
} from './apiUtils';

import {
  buildTaskPayload,
  normalizeTask,
} from './entityAdapters';

const taskBases = [
  '/MaintenanceTasks',
  '/maintenanceTasks',
  '/Tasks',
  '/tasks',
];

export const getTasks = async ({
  status = '',
  startDate = '',
  endDate = '',
} = {}) => {
  const params = buildQueryParams({
    status,
    taskStatus: status,
    startDate,
    endDate,
    from: startDate,
    to: endDate,
  });

  const response = await tryRequest(
    taskBases.map((basePath) => () =>
      api.get(basePath, { params })
    )
  );

  return extractCollection(response, [
    'tasks',
    'maintenanceTasks',
    'items',
    'data',
  ]).map(normalizeTask);
};

export const createTask = async (form) => {
  const payload = buildTaskPayload(form);

  const response = await tryRequest(
    taskBases.map((basePath) => () =>
      api.post(basePath, payload)
    )
  );

  return normalizeTask(
    extractEntity(response)
  );
};

export const updateTask = async (taskId, form) => {
  const payload = buildTaskPayload(form);

  const response = await tryRequest(
    taskBases.flatMap((basePath) => [
      () =>
        api.put(
          `${basePath}/${taskId}`,
          payload
        ),
      () =>
        api.patch(
          `${basePath}/${taskId}`,
          payload
        ),
    ])
  );

  return normalizeTask(
    extractEntity(response)
  );
};

export const deleteTask = async (taskId) => {
  await tryRequest(
    taskBases.flatMap((basePath) => [
      () =>
        api.delete(
          `${basePath}/${taskId}`
        ),
      () =>
        api.delete(basePath, {
          data: {
            id: taskId,
            taskId,
            maintenanceTaskId: taskId,
          },
        }),
    ])
  );
};