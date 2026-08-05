import { API_BASE_URL } from '../api.config';

export const HOUSE_API_ROUTES = {
    root: `${API_BASE_URL}/house`,
    batch: `${API_BASE_URL}/house/batch`,
    byId: (houseId: number) => `${API_BASE_URL}/house/${houseId}`,
} as const;
