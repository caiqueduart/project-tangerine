import { API_BASE_URL } from '../api.config';

export const USER_API_ROUTES = {
    register: `${API_BASE_URL}/user/register`,
    all: `${API_BASE_URL}/user/all`,
    byId: (userId: string) => `${API_BASE_URL}/user/${userId}`,
} as const;
