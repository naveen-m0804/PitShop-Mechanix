/// <reference types="vite/client" />
import axios from 'axios';

// In development, uses Vite proxy (relative path /api/v1)
// In production, uses VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1` 
  : '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Mechanic {
  id: string;
  shopName: string;
  phone: string;
  address: string;
  location: {
    type?: string;
    coordinates?: [number, number]; // [longitude, latitude]
    x?: number; // fallback for longitude
    y?: number; // fallback for latitude
  };
  shopTypes: string[];
  openTime: string;
  closeTime: string;
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  servicesOffered?: string;
  distance?: number;
}

export interface RepairRequest {
  id?: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  mechanicShopId?: string;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
  mechanicUserId?: string;
  vehicleType: 'TWO_WHEELER' | 'FOUR_WHEELER';
  problemDescription: string;
  repairGuess?: string;
  type: 'NORMAL' | 'SOS';
  status?: string;
  clientLocation: {
    type: string;
    coordinates: [number, number];
  };
  createdAt?: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  profilePicture?: string;
  mechanicShop?: Mechanic;
}

export const mechanicsApi = {
  getNearby: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    vehicleType?: string,
    includeUnavailable: boolean = false
  ) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusKm: radiusKm.toString(),
    });
    if (vehicleType) params.append('vehicleType', vehicleType);
    if (includeUnavailable) params.append('includeUnavailable', 'true');
    
    const response = await api.get<{success: boolean; data: Mechanic[]}>(`/mechanics/nearby?${params}`);
    return response.data.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get<{success: boolean; data: Mechanic}>(`/mechanics/${id}`);
    return response.data.data;
  },

  getAll: async () => {
    const response = await api.get<{success: boolean; data: Mechanic[]}>(`/mechanics/all`);
    return response.data.data;
  },
};

export const repairRequestsApi = {
  create: async (request: any) => {
    const response = await api.post('/requests', request);
    return response.data;
  },
  
  getMyRequests: async () => {
    const response = await api.get<{success: boolean; data: RepairRequest[]}>('/requests/my-requests');
    return response.data.data;
  },
};

export const mechanicApi = {
  getIncomingRequests: async () => {
    const response = await api.get<{success: boolean; data: RepairRequest[]}>('/mechanic/incoming-requests');
    return response.data.data;
  },
  getActiveJobs: async () => {
    const response = await api.get<{success: boolean; data: RepairRequest[]}>('/mechanic/active-jobs');
    return response.data.data;
  },
  getCompletedJobs: async () => {
    const response = await api.get<{success: boolean; data: RepairRequest[]}>('/mechanic/completed-jobs');
    return response.data.data;
  },
  getWorkHistory: async () => {
      const response = await api.get<{success: boolean; data: RepairRequest[]}>('/mechanic/work-history');
      return response.data.data;
  },
  acceptRequest: async (requestId: string) => {
    const response = await api.post<{success: boolean; data: RepairRequest}>(`/mechanic/accept-request/${requestId}`);
    return response.data.data;
  },
  rejectRequest: async (requestId: string) => {
    const response = await api.post<{success: boolean; data: RepairRequest}>(`/mechanic/reject-request/${requestId}`);
    return response.data.data;
  },
  updateStatus: async (requestId: string, status: string) => {
    const response = await api.post(`/mechanic/update-status/${requestId}`, { status });
    return response.data;
  },
  getActiveLocations: async () => {
    const response = await api.get<{success: boolean; data: any[]}>('/mechanic/active-locations');
    return response.data.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get<{success: boolean; data: UserProfile}>('/user/profile');
    return response.data.data;
  },
  updateProfile: async (data: { name: string; phone: string }) => {
    const response = await api.put<{success: boolean; data: UserProfile}>('/user/profile', data);
    return response.data.data;
  },
  updateMechanicShop: async (data: {
    shopName: string;
    phone: string;
    address: string;
    shopTypes: string[];
    openTime: string;
    closeTime: string;
    isAvailable: boolean;
    servicesOffered: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }) => {
    const response = await api.put<{success: boolean; data: Mechanic}>('/mechanic/update-shop', data);
    return response.data.data;
  },
};

export const aiApi = {
  diagnose: async (data: { issueDescription: string; make?: string; model?: string; year?: number }) => {
    const response = await api.post('/ai/diagnose', data);
    return response.data;
  },
};

export const ratingApi = {
  submitRating: async (data: { userId: string; mechanicShopId: string; rating: number; requestId?: string }) => {
    const response = await api.post('/ratings', data);
    return response.data;
  },
  getShopRatings: async (shopId: string) => {
    const response = await api.get<{success: boolean; data: any[]}>(`/ratings/shop/${shopId}`); // Adjust return type as needed
    return response.data; // Backend returns List<Rating> directly or wrapped? Controller returns ResponseEntity<List<Rating>> directly.
    // Wait, Controller returns ResponseEntity<List<Rating>> directly, not wrapped in {success: boolean, data: ...}.
    // My other endpoints seem to wrap data.
    // Let's check RatingController.java again.
    // It returns ResponseEntity.ok(savedRating) and ResponseEntity.ok(list).
    // It does NOT wrap in {success:true, data:...} structure unless I see a GlobalExceptionHandler or ResponseWrapper.
    // Looking at api.ts, most endpoints expect {success: boolean; data: T}.
    // Let's keep consistency. I should modify RatingController to wrap if possible, OR adjust frontend to match.
    // The previous code in RatingController returned `savedRating` directly.
    // Let me update api.ts to handle direct return for now, or better, update RatingController to be consistent. 
    // Actually, looking at `api.interceptors.response`, it just returns response.
    // So `response.data` will vary.
    // Let's assume for now I should match the pattern of other APIs if I can.
    // But I already wrote RatingController.
    // Let's just consume it as is.
    // Backend RatingController: return ResponseEntity.ok(savedRating);
    // So response.data IS the rating object.
  }
};

export const fixedRatingApi = {
    // Let's try to be consistent with existing codebase
    submit: async (data: any) => {
       return api.post('/ratings', data).then(res => res.data);
    },
    getByShop: async (shopId: string) => {
       return api.get(`/ratings/shop/${shopId}`).then(res => res.data);
    }
};

export default api;
