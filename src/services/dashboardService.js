import api from '../api/axiosConfig';

import {
  normalizeDashboardStats,
  tryRequest,
} from './apiUtils';

const dashboardPaths = [
  '/Dashboard',
  '/dashboard',
];

export const getDashboardSummary = async () => {
  const response = await tryRequest(
    dashboardPaths.map((path) => () =>
      api.get(path)
    )
  );

  return normalizeDashboardStats(response);
};