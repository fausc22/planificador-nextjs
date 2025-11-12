// pages/_app.jsx - Configuración global de la aplicación
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Prevenir zoom en iOS
    document.addEventListener('gesturestart', function (e) {
      e.preventDefault();
      document.body.style.zoom = 0.99;
    });

    document.addEventListener('gesturechange', function (e) {
      e.preventDefault();
      document.body.style.zoom = 0.99;
    });

    document.addEventListener('gestureend', function (e) {
      e.preventDefault();
      document.body.style.zoom = 1;
    });
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
        
        {/* Toast notifications globales */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

