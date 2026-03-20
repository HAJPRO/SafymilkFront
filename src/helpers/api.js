import axios from "axios";
import { jwtDecode } from "jwt-decode"; // To'g'ri import

const isProd = window.location.hostname !== "localhost";

const api = axios.create({
  baseURL: isProd
    ? "https://safymilk-core.company-erp.uz/api/v1"
    : "http://localhost:5000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    try {
      // ✅ JWT tokenni qismlarga bo'lib o'qiymiz
      const decoded = jwtDecode(token);
      console.log(decoded.companyCode)
      // ✅ Token payload'ida companyCode borligini tekshiramiz
      if (decoded && decoded.companyCode) {
        config.headers["X-Tenant-ID"] = decoded.companyCode;
      }
    } catch (error) {
      console.warn("Tokenni dekodlashda xatolik (ehtimol noto'g'ri format):", error);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;