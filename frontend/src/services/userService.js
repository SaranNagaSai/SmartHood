import api from './api';

export const getUserProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data?.data;
};

export const updateUserProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data?.data;
};

export const updateUserLocality = async (localityData) => {
    const response = await api.put('/users/locality', localityData);
    return response.data?.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
};

export const logoutAllSessions = async () => {
    const response = await api.post('/users/logout-all');
    return response.data;
};

export const deleteAccount = async () => {
    const response = await api.delete('/users/account');
    return response.data;
};
