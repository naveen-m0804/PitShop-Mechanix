import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import CreateRequest from "./pages/CreateRequest";

import Profile from "./pages/Profile";
import MyRequests from "./pages/MyRequests";
import MechanicDetails from "./pages/MechanicDetails";
import MechanicDashboard from "./pages/MechanicDashboard";
import MechanicMapView from "./pages/MechanicMapView";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { NotificationProvider } from "./contexts/NotificationContext";
import LocationTracker from "./components/LocationTracker";

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            <LocationTracker />
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Client-Only Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <MapView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-request"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mechanic/:id"
                  element={
                    <ProtectedRoute allowedRoles={['CLIENT']}>
                      <MechanicDetails />
                    </ProtectedRoute>
                  }
                />

                {/* Mechanic-Only Routes */}
                <Route
                  path="/mechanic-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['MECHANIC']}>
                      <MechanicDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mechanic-map"
                  element={
                    <ProtectedRoute allowedRoles={['MECHANIC']}>
                      <MechanicMapView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-history"
                  element={
                    <ProtectedRoute allowedRoles={['MECHANIC']}>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />

                {/* Shared Routes (Both roles) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
