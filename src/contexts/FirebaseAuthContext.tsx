import { createContext, useContext, useState, useEffect } from 'react';

interface FirebaseAuthContextType {
  idToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenExpirationTime, setTokenExpirationTime] = useState<number | null>(null);

  // Check if token is expired
  useEffect(() => {
    if (tokenExpirationTime) {
      const now = Date.now();
      const timeUntilExpiration = tokenExpirationTime - now;
      
      // If token will expire in less than 5 minutes, refresh it
      if (timeUntilExpiration > 0 && timeUntilExpiration < 300000) {
        refreshToken();
      }
    }
  }, [tokenExpirationTime]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBfauXsx1XKHY4_lzW8WCbiDwAFGFGLGtc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Authentication failed');
      }

      const data = await response.json();
      
      // Store token and expiration time
      setIdToken(data.idToken);
      setIsAuthenticated(true);
      
      // Calculate expiration time (current time + expiresIn * 1000 milliseconds)
      const expirationTime = Date.now() + data.expiresIn * 1000;
      setTokenExpirationTime(expirationTime);
      
      // Store in localStorage for persistence
      localStorage.setItem('idToken', data.idToken);
      localStorage.setItem('tokenExpirationTime', expirationTime.toString());
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIdToken(null);
    setIsAuthenticated(false);
    setTokenExpirationTime(null);
    localStorage.removeItem('idToken');
    localStorage.removeItem('tokenExpirationTime');
  };

  const refreshToken = async () => {
    try {
      setLoading(true);
      // For now, we'll just log out and require re-login when token expires
      // In a real implementation, you would use Firebase's refresh token mechanism
      logout();
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('idToken');
        const storedExpirationTime = localStorage.getItem('tokenExpirationTime');
        
        if (storedToken && storedExpirationTime) {
          const expirationTime = parseInt(storedExpirationTime);
          
          // Check if token is still valid
          if (Date.now() < expirationTime) {
            setIdToken(storedToken);
            setIsAuthenticated(true);
            setTokenExpirationTime(expirationTime);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('idToken');
            localStorage.removeItem('tokenExpirationTime');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <FirebaseAuthContext.Provider
      value={{
        idToken,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
} 