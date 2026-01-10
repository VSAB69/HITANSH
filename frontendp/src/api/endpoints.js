import axios from "axios";

// 1. Use localhost instead of 127.0.0.1 to avoid cookie domain mismatch
const AUTH_BASE_URL = "https://cadencea-backend.onrender.com/auth/";
// 2. FIX: Set app base URL to the root, as requested
const APP_BASE_URL = "https://cadencea-backend.onrender.com";

// 3. Create an Axios client for AUTH functions
const authApiClient = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
});

// 3. Create an Axios client for regular APP functions
const appApiClient = axios.create({
  baseURL: APP_BASE_URL,
  withCredentials: true,
});

// 4. Add the interceptor ONLY to the appApiClient
appApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("token/refresh")
    ) {
      originalRequest._retry = true;
      try {
        // 5. Use the authApiClient to refresh the token
        await authApiClient.post("token/refresh/");
        // 6. Retry the original request with the appApiClient
        return appApiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// ---- AUTH ENDPOINTS (using authApiClient) ----
export const login = async (username, password) => {
  const response = await authApiClient.post("login/", { username, password });
  return response.data;
};

export const register = async (
  username,
  email,
  password,
  role = "participant"
) => {
  const response = await authApiClient.post("register/", {
    username,
    email,
    password,
    role,
  });
  return response.data;
};

export const logout = async () => {
  const response = await authApiClient.post("logout/", {});
  return response.data;
};

export const authenticated_user = async () => {
  const response = await authApiClient.get("authenticated/");
  return response.data;
};

export { appApiClient, authApiClient };
