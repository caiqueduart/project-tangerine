import { API_BASE_URL } from '../api.config';

export const HOUSE_API_ROUTES = {
    root: `${API_BASE_URL}/house`,
    byId: (houseId: number) => `${API_BASE_URL}/house/${houseId}`,
} as const;
