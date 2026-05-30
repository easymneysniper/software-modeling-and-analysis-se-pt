export const API_BASE_URL = "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("bazar_token");
}

export function setToken(token) {
  localStorage.setItem("bazar_token", token);
  window.dispatchEvent(new Event("authChanged"));
}

export function removeToken() {
  localStorage.removeItem("bazar_token");
  localStorage.removeItem("bazar_user");
  window.dispatchEvent(new Event("authChanged"));
}

export function getStoredUser() {
  const user = localStorage.getItem("bazar_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem("bazar_user", JSON.stringify(user));
  window.dispatchEvent(new Event("authChanged"));
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = "Възникна грешка.";

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function loginRequest(username, password) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    let errorMessage = "Грешен username/email или парола.";

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}