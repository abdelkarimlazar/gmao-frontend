import { getApiBaseUrl } from '../api/axiosConfig';

export const extractPayload = (response) => {
  return response?.data ?? response;
};

export const removeEmptyValues = (payload) => {
  return Object.fromEntries(
    Object.entries(payload || {}).filter(([, value]) => {
      if (value === undefined || value === null || value === '') {
        return false;
      }

      if (Array.isArray(value) && value.length === 0) {
        return false;
      }

      return true;
    })
  );
};

export const parseApiError = (
  error,
  fallback = 'Une erreur est survenue lors de la communication avec le serveur.'
) => {
  const payload = error?.response?.data;

  if (!error?.response) {
    return `Le backend est inaccessible. Vérifiez que l'API ASP.NET Core est démarrée sur ${getApiBaseUrl()}.`;
  }

  if (typeof payload === 'string') {
    if (
      payload.includes(
        'Unable to connect to any of the specified MySQL hosts'
      )
    ) {
      return 'Le backend est joignable, mais la base MySQL est indisponible. Vérifiez la connexion MySQL du projet ASP.NET Core.';
    }

    if (payload.includes('MySqlException')) {
      return 'Une erreur MySQL est remontée par le backend. Consultez la configuration de la base ou les logs Visual Studio.';
    }

    if (payload.trim()) {
      return payload.split('\n').find((line) => line.trim()) || payload;
    }
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.title) {
    return payload.title;
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    const details = Object.values(payload.errors).flat().join(' ');

    if (details) {
      return details;
    }
  }

  return error?.message || fallback;
};

export const findFirstDefined = (source, keys, fallback = null) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return fallback;
};

export const findFirstArray = (source, keys = []) => {
  for (const key of keys) {
    if (Array.isArray(source?.[key])) {
      return source[key];
    }

    if (Array.isArray(source?.[key]?.$values)) {
      return source[key].$values;
    }
  }

  if (Array.isArray(source)) {
    return source;
  }

  if (Array.isArray(source?.$values)) {
    return source.$values;
  }

  if (Array.isArray(source?.data)) {
    return source.data;
  }

  if (Array.isArray(source?.items)) {
    return source.items;
  }

  if (Array.isArray(source?.results)) {
    return source.results;
  }

  if (Array.isArray(source?.records)) {
    return source.records;
  }

  if (source && typeof source === 'object') {
    const firstArray = Object.values(source).find(Array.isArray);

    if (firstArray) {
      return firstArray;
    }
  }

  return [];
};

export const extractCollection = (payload, collectionKeys = []) => {
  const data = extractPayload(payload);
  const fromData = findFirstArray(data, collectionKeys);

  if (fromData.length > 0) {
    return fromData;
  }

  if (data?.data && typeof data.data === 'object') {
    return findFirstArray(data.data, collectionKeys);
  }

  return fromData;
};

export const extractEntity = (payload) => {
  const data = extractPayload(payload);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  if (
    data.data &&
    typeof data.data === 'object' &&
    !Array.isArray(data.data)
  ) {
    return data.data;
  }

  if (
    data.item &&
    typeof data.item === 'object' &&
    !Array.isArray(data.item)
  ) {
    return data.item;
  }

  return data;
};

const parsePaginationHeader = (headers) => {
  const rawHeader = headers?.['x-pagination'] || headers?.['X-Pagination'];

  if (!rawHeader || typeof rawHeader !== 'string') {
    return {};
  }

  try {
    return JSON.parse(rawHeader);
  } catch {
    return {};
  }
};

export const extractPagination = (payload, fallback = {}) => {
  const data = extractPayload(payload);
  const headersPagination = parsePaginationHeader(payload?.headers);
  const nested = data?.pagination || data?.meta || headersPagination;

  const totalCount = findFirstDefined(
    data,
    ['totalCount', 'totalItems', 'count'],
    findFirstDefined(
      nested,
      ['totalCount', 'totalItems', 'count'],
      fallback.totalCount ?? 0
    )
  );

  const pageNumber = findFirstDefined(
    data,
    ['pageNumber', 'currentPage', 'pageIndex'],
    findFirstDefined(
      nested,
      ['pageNumber', 'currentPage', 'pageIndex'],
      fallback.pageNumber ?? 1
    )
  );

  const pageSize = findFirstDefined(
    data,
    ['pageSize', 'itemsPerPage'],
    findFirstDefined(
      nested,
      ['pageSize', 'itemsPerPage'],
      fallback.pageSize ?? 10
    )
  );

  const totalPages = findFirstDefined(
    data,
    ['totalPages'],
    findFirstDefined(
      nested,
      ['totalPages'],
      pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1
    )
  );

  return {
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
  };
};

export const buildQueryParams = (params) => {
  const result = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  });

  return result;
};

export const tryRequest = async (requestFactories) => {
  let lastError;

  for (const factory of requestFactories) {
    try {
      return await factory();
    } catch (error) {
      if (!error?.response) {
        throw error;
      }

      if (![404, 405].includes(error.response.status)) {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError || new Error("Aucun endpoint compatible n'a répondu.");
};

export const extractToken = (payload) => {
  const data = extractPayload(payload);

  return findFirstDefined(data, [
    'token',
    'accessToken',
    'jwt',
    'jwtToken',
  ]);
};

export const normalizeDashboardStats = (payload) => {
  const data = extractPayload(payload);
  const source = data?.stats || data;

  const getMetric = (keys) => {
    const value = findFirstDefined(source, keys, 0);
    return Number(value || 0);
  };

  return {
    totalUsers: getMetric(['totalUsers', 'usersCount', 'userCount']),
    totalEquipments: getMetric([
      'totalEquipments',
      'equipmentsCount',
      'equipmentCount',
    ]),
    brokenEquipments: getMetric([
      'brokenEquipments',
      'brokenEquipmentCount',
    ]),
    pendingTasks: getMetric(['pendingTasks', 'pendingTaskCount']),
    inProgressTasks: getMetric([
      'inProgressTasks',
      'inProgressTaskCount',
    ]),
    completedTasks: getMetric([
      'completedTasks',
      'completedTaskCount',
      'doneTasks',
    ]),
    openBreakdowns:
      getMetric([
        'openBreakdowns',
        'breakdownsOpen',
        'openBreakdownCount',
      ]) ||
      getMetric(['pendingBreakdowns']) +
        getMetric(['inProgressBreakdowns']),
  };
};

export const normalizeText = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback;
  }

  const text = String(value).trim();

  return text || fallback;
};

export const normalizeDateInput = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

export const formatDateLabel = (value) => {
  if (!value) {
    return 'Non disponible';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const createOptimisticId = (prefix = 'item') => {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};