import { getStoredUser, getToken, removeToken } from "./api";

export function isAuthenticated() {
  return Boolean(getToken());
}

export function currentUser() {
  return getStoredUser();
}

export function logout() {
  removeToken();
  window.location.href = "/";
}