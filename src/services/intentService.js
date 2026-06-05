import api from '../api/axiosConfig';

export const getIntentDemandes = async () => {
  const response = await api.get('/Intent');
  return response.data;
};

export const acceptIntentDemande = async (id) => {
  const response = await api.post(`/Intent/${id}/accept`);
  return response.data;
};

export const refuseIntentDemande = async (id, motif) => {
  const response = await api.post(`/Intent/${id}/refuse`, { motif });
  return response.data;
};

export const getIntentHistorique = async (id) => {
  const response = await api.get(`/Intent/${id}/historique`);
  return response.data;
};