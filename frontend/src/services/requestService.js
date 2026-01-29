import api from './api';

export const getServiceRequests = async (params) => {
    const response = await api.get('/services', { params });
    return response.data;
};

export const createServiceRequest = async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
};

export const updateServiceStatus = async (id, status) => {
    const response = await api.put(`/services/${id}/status`, { status });
    return response.data;
};
