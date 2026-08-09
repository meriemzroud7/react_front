import axios from 'axios';

const apiUrl = 'http://localhost:8001'; // FastAPI, différent de Spring Boot (8080)

export async function envoyerMessageChatbotIA(message) {
    return await axios.post(`${apiUrl}/chat`, { message });
}