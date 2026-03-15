import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}` + "/api/auth" || "http://localhost:8080/api/auth",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data;

    const message =
      typeof serverMessage === "string" && serverMessage
        ? serverMessage
        : status === 429
        ? "Too many requests — please slow down."
        : status === 401
        ? "Invalid credentials."
        : status === 400
        ? "Invalid request. Please check your details."
        : "Something went wrong. Please try again.";

    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  /** POST /api/auth/register — { username, email, password } → AuthResponse */
  register: (data) => api.post("/register", data),

  /** POST /api/auth/login — { usernameOrEmail, password } → AuthResponse */
  login: (data) => api.post("/login", data),

  /** POST /api/auth/restpass — { email, newPassword } → string */
  resetPassword: (data) => api.post("/restpass", data),

 
  googleAuth: (idToken) => api.post("/google", { idToken }),

  /** GET /api/auth/valid/{token} → boolean */
  validateToken: (token) => api.get(`/valid/${token}`),

  /** GET /api/auth/{token} → AuthResponse */
  processToken: (token) => api.get(`/${token}`),
};