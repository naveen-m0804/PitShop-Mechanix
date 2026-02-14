import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import { NotificationProvider } from "./contexts/NotificationContext";
import LocationTracker from "./components/LocationTracker";
import { lazy, Suspense } from "react";
import PageLoader from "./components/ui/PageLoader";

// Lazy load pages for optimization
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MapView = lazy(() => import("./pages/MapView"));
const CreateRequest = lazy(() => import("./pages/CreateRequest"));
const Profile = lazy(() => import("./pages/Profile"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const MechanicDetails = lazy(() => import("./pages/MechanicDetails"));
const MechanicDashboard = lazy(() => import("./pages/MechanicDashboard"));
const MechanicMapView = lazy(() => import("./pages/MechanicMapView"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
