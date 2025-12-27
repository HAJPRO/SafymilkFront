import axios from "axios";
import Cookies from "js-cookie";

const isProd = window.location.hostname !== "localhost";

const api = axios.create({
  baseURL: isProd
    ? "https://safymilk-core.company-erp.uz/api/v1"
    : "http://localhost:5000/api/v1",
});

// Har bir so‘rovga token avtomatik qo‘shiladi
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
