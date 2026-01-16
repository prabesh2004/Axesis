import { useMutation } from "@tanstack/react-query";
import * as authService from "@/services/auth";
import { getAuthToken, setAuthToken } from "@/services/authToken";

export const getStoredToken = getAuthToken;
export const setStoredToken = setAuthToken;

export function useRegisterMutation() {
  return useMutation({
    mutationFn: authService.register,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: authService.login,
  });
}
