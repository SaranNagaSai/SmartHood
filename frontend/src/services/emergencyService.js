import api from './api';

export const getEmergencies = async () => {
    const response = await api.get('/emergencies');
    return response.data;
};

export const createEmergency = async (emergencyData) => {
    const response = await api.post('/emergencies', emergencyData);
    return response.data;
};

export const respondToEmergency = async (id) => {
    const response = await api.put(`/emergencies/${id}/respond`);
    return response.data;
};
