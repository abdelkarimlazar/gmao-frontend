import api from '../api/axiosConfig';

import {
  buildQueryParams,
  extractCollection,
  extractEntity,
  extractPagination,
  tryRequest,
} from './apiUtils';

import {
  buildUserPayload,
  normalizeUser,
} from './entityAdapters';

const userBases = [
  '/Users',
  '/users',
];

export const getUsers = async ({
  search = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = buildQueryParams({
    pageNumber: page,
    page,
    pageSize,
    search,
    searchTerm: search,
    query: search,
  });

  const response = await tryRequest(
    userBases.map((basePath) => () =>
      api.get(basePath, { params })
    )
  );

  const items = extractCollection(response, [
    'users',
    'items',
    'data',
  ]).map(normalizeUser);

  return {
    items,
    pagination: extractPagination(response, {
      totalCount: items.length,
      pageNumber: page,
      pageSize,
    }),
  };
};

export const createUser = async (form) => {
  const payload = buildUserPayload(form, {
    includePassword: true,
  });

  const response = await tryRequest(
    userBases.map((basePath) => () =>
      api.post(basePath, payload)
    )
  );

  return normalizeUser(
    extractEntity(response)
  );
};

export const updateUser = async (userId, form) => {
  const payload = buildUserPayload(
    {
      ...form,
      password: form.password || '123456',
    },
    {
      includePassword: true,
    }
  );

  console.log('UPDATE USER PAYLOAD:', payload);

  const response = await tryRequest(
    userBases.flatMap((basePath) => [
      () => api.put(`${basePath}/${userId}`, payload),
      () => api.patch(`${basePath}/${userId}`, payload),
    ])
  );

  return normalizeUser(extractEntity(response));
};

export const deleteUser = async (userId) => {
  await tryRequest(
    userBases.flatMap((basePath) => [
      () =>
        api.delete(
          `${basePath}/${userId}`
        ),
      () =>
        api.delete(basePath, {
          data: {
            id: userId,
            userId,
          },
        }),
    ])
  );
};