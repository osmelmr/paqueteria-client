import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import type { LoginDto } from '../api/auth.api';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      logout();
    },
  });
}
