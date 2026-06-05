import './App.css';

import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastContext';

import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;