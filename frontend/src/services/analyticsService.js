import api from './api';

export const getPlatformAnalytics = async () => {
    const response = await api.get('/analytics');
    return response.data;
};

export const getUserAnalytics = async (userId) => {
    const url = userId ? `/analytics/user/${userId}` : '/analytics/user';
    const response = await api.get(url);
    return response.data;
};
