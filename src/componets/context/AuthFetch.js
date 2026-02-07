// AuthFetch.js

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthFetch = () => {
  const navigate = useNavigate();

  const authFetch = useCallback(async (url, options = {}) => {
    // Get auth data from localStorage
    const storedAuth = localStorage.getItem('auth');
    if (!storedAuth) {
      console.error("User is not authenticated. Redirecting to login page.");
      navigate('/Login');
      return Promise.reject(new Error("User not authenticated"));
    }

    const auth = JSON.parse(storedAuth);

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${auth.access}`,
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      },
    });

    // If token expired (401 Unauthorized), redirect to login
    if (response.status === 401) {
      console.error("Session expired. Redirecting to login page.");
      localStorage.removeItem('auth');
      navigate('/Login');
      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    return response;
  }, [navigate]);

  return authFetch;
};
