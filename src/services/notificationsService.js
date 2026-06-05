import api from '../api/axiosConfig';

export const getNotifications = async () => {
  const response = await api.get('/Notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  await api.put(`/Notifications/${id}/read`);
};