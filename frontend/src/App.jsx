import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { loadUserFromStorage } from './store/authSlice';

// Pages
import LoginPage from './pages/LoginPage';
import ClientHomePage from './pages/ClientHomePage';
import MapViewPage from './pages/MapViewPage';
import CreateRequestPage from './pages/CreateRequestPage';
import MyRequestsPage from './pages/MyRequestsPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import MechanicDashboard from './pages/MechanicDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to={user?.role === 'CLIENT' ? '/home' : '/mechanic'} replace /> : 
              <LoginPage />
          } 
        />
        
        {/* Client Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute role="CLIENT">
              <ClientHomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/map" 
          element={
            <ProtectedRoute role="CLIENT">
              <MapViewPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-request/:shopId" 
          element={
            <ProtectedRoute role="CLIENT">
              <CreateRequestPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-requests" 
          element={
            <ProtectedRoute role="CLIENT">
              <MyRequestsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tracking/:requestId" 
          element={
            <ProtectedRoute role="CLIENT">
              <LiveTrackingPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Mechanic Routes */}
        <Route 
          path="/mechanic" 
          element={
            <ProtectedRoute role="MECHANIC">
              <MechanicDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to={user?.role === 'CLIENT' ? '/home' : '/mechanic'} replace /> : 
              <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
