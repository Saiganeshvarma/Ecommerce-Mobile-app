import { useAppSelector } from './useAppSelector';
import { selectCurrentUser, selectIsAuthenticated, selectToken } from '@redux/slices/authSlice';

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);
  const isAdmin = user?.role === 'admin';

  return { user, isAuthenticated, token, isAdmin };
};
