import api from '../api/axiosConfig';

import {
  extractCollection,
  extractEntity,
  extractPayload,
  tryRequest,
} from './apiUtils';

import {
  buildBreakdownPayload,
  normalizeBreakdown,
} from './entityAdapters';

const breakdownBases = [
  '/Breakdowns',
  '/breakdowns',
];

export const getBreakdowns = async () => {
  const response = await tryRequest(
    breakdownBases.map((basePath) => () =>
      api.get(basePath)
    )
  );

  return extractCollection(response, [
    'breakdowns',
    'items',
    'data',
  ]).map(normalizeBreakdown);
};

export const createBreakdown = async (form) => {
  const payload = buildBreakdownPayload(form);

  const response = await tryRequest(
    breakdownBases.map((basePath) => () =>
      api.post(basePath, payload)
    )
  );

  return normalizeBreakdown(
    extractEntity(response)
  );
};

export const updateBreakdown = async (
  breakdownId,
  form
) => {
  const payload = buildBreakdownPayload(form);

  const response = await tryRequest(
    breakdownBases.flatMap((basePath) => [
      () =>
        api.put(
          `${basePath}/${breakdownId}`,
          payload
        ),
      () =>
        api.patch(
          `${basePath}/${breakdownId}`,
          payload
        ),
    ])
  );

  return normalizeBreakdown(
    extractEntity(response)
  );
};

export const updateBreakdownStatus = async (
  breakdown,
  status
) => {
  const payload = buildBreakdownPayload({
    ...breakdown,
    status,
  });

  console.log('UPDATE BREAKDOWN STATUS PAYLOAD:', payload);

  const response = await tryRequest(
    breakdownBases.flatMap((basePath) => [
      () =>
        api.put(
          `${basePath}/${breakdown.id}`,
          payload
        ),
      () =>
        api.patch(
          `${basePath}/${breakdown.id}`,
          payload
        ),
    ])
  );

  return extractPayload(response);
};

export const deleteBreakdown = async (
  breakdownId
) => {
  await tryRequest(
    breakdownBases.flatMap((basePath) => [
      () =>
        api.delete(
          `${basePath}/${breakdownId}`
        ),
      () =>
        api.delete(basePath, {
          data: {
            id: breakdownId,
            breakdownId,
          },
        }),
    ])
  );
};