import api from "./api";

export const getDashboard = async (studentId) => {
    const response = await api.get(`/dashboard/${studentId}`);
    return response.data;
};