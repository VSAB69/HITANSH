import axios from "axios";

const BASE_URL = "https://cadencea-backend.onrender.com";

// ─────────────────────────────
// AUTH CLIENT (no interceptor)
// ─────────────────────────────
const authApiClient = axios.create({
  baseURL: `${BASE_URL}/auth/`,
  withCredentials: true,
});

// ─────────────────────────────
// APP CLIENT (WITH REFRESH)
// ─────────────────────────────
const appApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 🔁 Refresh interceptor
appApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("token/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await authApiClient.post("token/refresh/");
        return appApiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────
export const login = async (username, password) => {
  const res = await authApiClient.post("login/", { username, password });
  return res.data;
};

export const register = async (username, email, password, role = "client") => {
  const res = await authApiClient.post("register/", {
    username,
    email,
    password,
    role,
  });
  return res.data;
};

export const logout = async () => {
  const res = await authApiClient.post("logout/");
  return res.data;
};

// ✅ MUST USE appApiClient
export const authenticated_user = async () => {
  const res = await appApiClient.get("/auth/authenticated/");
  return res.data;
};

export { appApiClient, authApiClient };
