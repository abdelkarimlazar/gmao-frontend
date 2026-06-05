import api from '../api/axiosConfig';

import {
  buildQueryParams,
  extractCollection,
  extractEntity,
  extractPagination,
  tryRequest,
} from './apiUtils';

import {
  buildEquipmentPayload,
  normalizeEquipment,
} from './entityAdapters';

const equipmentBases = [
  '/Equipments',
  '/equipments',
  '/equipment',
];

export const getEquipments = async ({
  status = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = buildQueryParams({
    pageNumber: page,
    pageSize,
    status: status !== '' ? status : undefined,
  });

  const response = await tryRequest(
    equipmentBases.map((basePath) => () =>
      api.get(basePath, { params })
    )
  );

  const items = extractCollection(response, [
    'items',
    'equipments',
    'equipment',
    'data',
  ]).map(normalizeEquipment);

  return {
    items,
    pagination: extractPagination(response, {
      totalCount: items.length,
      pageNumber: page,
      pageSize,
    }),
  };
};

export const createEquipment = async (form) => {
  const payload = buildEquipmentPayload(form);

  const response = await tryRequest(
    equipmentBases.map((basePath) => () =>
      api.post(basePath, payload)
    )
  );

  return normalizeEquipment(extractEntity(response));
};

export const updateEquipment = async (equipmentId, form) => {
  const payload = buildEquipmentPayload(form);

  console.log('UPDATE EQUIPMENT PAYLOAD:', payload);

  const response = await tryRequest(
    equipmentBases.flatMap((basePath) => [
      () => api.put(`${basePath}/${equipmentId}`, payload),
      () => api.patch(`${basePath}/${equipmentId}`, payload),
    ])
  );

  return normalizeEquipment(extractEntity(response));
};

export const deleteEquipment = async (equipmentId) => {
  await tryRequest(
    equipmentBases.flatMap((basePath) => [
      () => api.delete(`${basePath}/${equipmentId}`),
      () =>
        api.delete(basePath, {
          data: {
            id: equipmentId,
            equipmentId,
          },
        }),
    ])
  );
};