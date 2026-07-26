import axios from 'axios';

const apiUrl = 'http://localhost:8080/api/coach';

export async function getCoachHistory(userId) {
    return await axios.get(`${apiUrl}/${userId}`);
}

export async function sendCoachMessage(userId, message) {
    return await axios.post(`${apiUrl}/${userId}`, { message });
}

export async function clearCoachHistory(userId) {
    return await axios.delete(`${apiUrl}/${userId}`);
}