import axios from "axios";
import {
  clearAuthSessionStorage,
  getAuthToken,
} from "../contexts/authStorage";

// API Base URL - usa variável de ambiente ou fallback para desenvolvimento
export const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/";

export const api = axios.create({
  baseURL: apiBaseURL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  function (response) {
    if (import.meta.env.VITE_DEBUG) console.log(response);
    return response;
  },
  async function (error) {
    if (import.meta.env.VITE_DEBUG) console.error(error);
    if (error.response?.status === 401) clearAuthSessionStorage();
    return Promise.reject(error);
  }
);

export default api;

export type Map = {
  [id: number | string]: number;
};

export type Errors = {
  [key: string]: string[];
};
