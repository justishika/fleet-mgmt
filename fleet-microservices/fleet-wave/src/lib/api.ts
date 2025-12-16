import axios from 'axios';

// API Base URLs - Now using API Gateway (Port 9000)
// If VITE_ env vars are set, use them. Otherwise default to Gateway.
const FLEET_BASE_URL = import.meta.env.VITE_FLEET_BASE_URL || 'http://localhost:9000';
const DRIVER_BASE_URL = import.meta.env.VITE_DRIVER_BASE_URL || 'http://localhost:9000';
const DISPATCH_BASE_URL = import.meta.env.VITE_DISPATCH_BASE_URL || 'http://localhost:9000'; // /auth and /jobs are under root context via gateway routes

// Axios Instances
const fleetApi = axios.create({ baseURL: FLEET_BASE_URL });
const driverApi = axios.create({ baseURL: DRIVER_BASE_URL });
const dispatchApi = axios.create({ baseURL: DISPATCH_BASE_URL });

// Interceptor for JWT
const addTokenInterceptor = (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const handleAuthError = (error: any) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('token');
        localStorage.removeItem('driverId'); // Clear driverId too just in case
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
};

fleetApi.interceptors.request.use(addTokenInterceptor);
driverApi.interceptors.request.use(addTokenInterceptor);
dispatchApi.interceptors.request.use(addTokenInterceptor);

fleetApi.interceptors.response.use((response) => response, handleAuthError);
driverApi.interceptors.response.use((response) => response, handleAuthError);
dispatchApi.interceptors.response.use((response) => response, handleAuthError);

// --- Types ---
export interface Vehicle {
    id: string;
    plate: string;
    type: string;
    status: string; // AVAILABLE, IN_TRANSIT, MAINTENANCE, UNAVAILABLE
    lastLocation: string;
    assignedDriverId?: string;
    health?: string;
}

export interface Driver {
    id: string;
    name: string;
    licenseClass: string;
    availability: boolean;
    status: string; // ACTIVE, ON_LEAVE, EMERGENCY
    location: string;
    destination?: string;
    assignedVehicleId?: string;
    rating?: number;
}

export interface Job {
    id: string;
    pickup: string;
    destination: string;
    status: string; // PENDING, IN_PROGRESS, COMPLETED, NEEDS_ATTENTION
    vehicleId?: string;
    driverId?: string;
    createdAt?: string;
}

// --- API Methods ---
export const api = {
    auth: {
        login: (credentials: any) => dispatchApi.post('/auth/login', credentials).then(r => r.data),
        provisionDriver: (driverUser: any) => dispatchApi.post('/auth/provision-driver', driverUser).then(r => r.data),
    },
    fleet: {
        list: () => fleetApi.get<Vehicle[]>('/vehicles').then(r => r.data),
        create: (v: Partial<Vehicle>) => fleetApi.post<Vehicle>('/vehicles', v).then(r => r.data),
        update: (id: string, v: Partial<Vehicle>) => fleetApi.put<Vehicle>(`/vehicles/${id}`, v).then(r => r.data),
        delete: (id: string) => fleetApi.delete(`/vehicles/${id}`),
        getAvailable: (type: string) => fleetApi.get<Vehicle>(`/vehicles/available?type=${encodeURIComponent(type)}`).then(r => r.data),
        getByPlate: (plate: string) => fleetApi.get<Vehicle>(`/vehicles/by-plate/${encodeURIComponent(plate)}`).then(r => r.data),
        updateStatus: (id: string, status: string) => fleetApi.put(`/vehicles/${id}/status?status=${encodeURIComponent(status)}`),
        assignDriver: (id: string, driverId: string) => fleetApi.put<Vehicle>(`/vehicles/${id}/assign-driver/${encodeURIComponent(driverId)}`).then(r => r.data),
    },
    drivers: {
        list: () => driverApi.get<Driver[]>('/drivers').then(r => r.data),
        create: (d: Partial<Driver>) => driverApi.post<Driver>('/drivers', d).then(r => r.data),
        get: (id: string) => driverApi.get<Driver>(`/drivers/${id}`).then(r => r.data),
        delete: (id: string) => driverApi.delete(`/drivers/${id}`),
        updateAvailability: (id: string, available: boolean) => driverApi.put(`/drivers/${id}/availability?available=${available}`),
        updateLocation: (id: string, loc: string, dest: string) => driverApi.put(`/drivers/${id}/location?location=${loc}&destination=${dest}`),
        updateDetails: (id: string, d: Partial<Driver>) => driverApi.put<Driver>(`/drivers/${id}`, d).then(r => r.data),
        applyLeave: (id: string) => driverApi.post(`/drivers/${id}/leave`),
        raiseEmergency: (id: string) => driverApi.post(`/drivers/${id}/emergency`),
    },
    dispatch: {
        list: () => dispatchApi.get<Job[]>('/jobs').then(r => r.data),
        create: (m: Partial<Job>) => dispatchApi.post<Job>('/jobs', m).then(r => r.data),
        get: (id: string) => dispatchApi.get<Job>(`/jobs/${id}`).then(r => r.data),
        update: (id: string, j: Partial<Job>) => dispatchApi.put<Job>(`/jobs/${id}`, j).then(r => r.data),
        delete: (id: string) => dispatchApi.delete(`/jobs/${id}`),
        markArrival: (id: string) => dispatchApi.put(`/jobs/${id}/mark-arrival`),
        markStop: (id: string, stopName: string) => dispatchApi.put(`/jobs/${id}/mark-stop?stopName=${stopName}`),
        emergency: (id: string) => dispatchApi.post(`/jobs/${id}/emergency`),
    }
};

export { fleetApi, driverApi, dispatchApi };
