import { API_BASE_URL } from '../api.config';

export const USER_API_ROUTES = {
    root: `${API_BASE_URL}/user`,
    all: `${API_BASE_URL}/user/all`,
    byId: (userId: string) => `${API_BASE_URL}/user/${userId}`,
    details: (userId: string) => `${API_BASE_URL}/user/${userId}/details`,
    provisionalPassword: (userId: string) => `${API_BASE_URL}/user/${userId}/provisional-password`,
} as const;
