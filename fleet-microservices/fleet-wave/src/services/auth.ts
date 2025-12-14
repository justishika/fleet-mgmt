import { api } from '@/lib/api';

export interface User {
    username: string;
    role: string;
    token?: string;
}

export const login = async (credentials: { username: string; password: string }) => {
    const data = await api.auth.login(credentials);
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', credentials.username);
    }
    return data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
