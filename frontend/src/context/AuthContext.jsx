import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = 'kiangini_access_token';
const REFRESH_TOKEN_KEY = 'kiangini_refresh_token';

function getUserDisplayName(user) {
  if (!user) {
    return '';
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim();

  return fullName || user.username || user.email;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Update the authenticated user everywhere in the app.
   *
   * useCallback keeps the function reference stable so components
   * such as OfficerProfile do not repeatedly trigger their effects.
   */
  const updateUser = useCallback((updatedUser) => {
    setUser({
      ...updatedUser,
      name: getUserDisplayName(updatedUser),
    });
  }, []);

  /*
   * Login
   */
  const login = async (email, password) => {
    const data = await authService.login(
      email,
      password,
    );

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      data.access,
    );

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      data.refresh,
    );

    const authenticatedUser = {
      ...data.user,
      name: getUserDisplayName(data.user),
    };

    setUser(authenticatedUser);

    return authenticatedUser;
  };

  /*
   * Register
   */
  const register = async (userData) => {
    return authService.register(userData);
  };

  /*
   * Logout
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error(
        'Unable to record server logout.',
        error,
      );
    } finally {
      localStorage.removeItem(
        ACCESS_TOKEN_KEY,
      );

      localStorage.removeItem(
        REFRESH_TOKEN_KEY,
      );

      setUser(null);
    }
  };

  /*
   * Restore authentication session when the application starts.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem(
        ACCESS_TOKEN_KEY,
      );

      const refreshToken = localStorage.getItem(
        REFRESH_TOKEN_KEY,
      );

      /*
       * No saved authentication tokens.
       */
      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        /*
         * First try the existing access token.
         */
        const currentUser =
          await authService.getMe();

        setUser({
          ...currentUser,
          name: getUserDisplayName(currentUser),
        });
      } catch (error) {
        console.error(
          'Unable to restore authentication session.',
          error,
        );

        try {
          /*
           * Access token may have expired.
           * Use the refresh token to obtain a new one.
           */
          const refreshData =
            await authService.refreshToken(
              refreshToken,
            );

          /*
           * Save the new access token.
           */
          localStorage.setItem(
            ACCESS_TOKEN_KEY,
            refreshData.access,
          );

          /*
           * Because SimpleJWT is configured with
           * ROTATE_REFRESH_TOKENS=True, a new refresh
           * token may also be returned.
           */
          if (refreshData.refresh) {
            localStorage.setItem(
              REFRESH_TOKEN_KEY,
              refreshData.refresh,
            );
          }

          /*
           * Fetch the authenticated user again
           * using the new access token.
           */
          const currentUser =
            await authService.getMe();

          setUser({
            ...currentUser,
            name: getUserDisplayName(currentUser),
          });
        } catch (refreshError) {
          console.error(
            'Authentication session has expired.',
            refreshError,
          );

          /*
           * Refresh token is no longer valid.
           * Clear the session completely.
           */
          localStorage.removeItem(
            ACCESS_TOKEN_KEY,
          );

          localStorage.removeItem(
            REFRESH_TOKEN_KEY,
          );

          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}