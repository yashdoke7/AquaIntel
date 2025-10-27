// API Service Layer - All backend communication

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Types matching your backend
export interface RouteRequest {
    start_latitude: number;
    start_longitude: number;
    end_latitude: number;
    end_longitude: number;
}

export interface RouteResponse {
    path: [number, number][];  // Array of [lat, lon] pairs
    distance?: number;
    estimatedTime?: number;
    message?: string;
}

export class APIError extends Error {
    constructor(
        message: string,
        public status?: number,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

class AquaIntelAPI {
    private baseURL: string;

    constructor(baseURL: string = API_BASE) {
        this.baseURL = baseURL;
    }

    async healthCheck(): Promise<{ status: string; message: string; version: string }> {
        const response = await fetch(`${this.baseURL}/health`);
    
        if (!response.ok) {
            throw new APIError('Health check failed', response.status);
        }
    
        return response.json();
    }

    async calculateRoute(
        startLat: number,
        startLon: number,
        endLat: number,
        endLon: number
    ): Promise<RouteResponse> {
    try {
        const request: RouteRequest = {
            start_latitude: startLat,
            start_longitude: startLon,
            end_latitude: endLat,
            end_longitude: endLon,
        };

        const response = await fetch(`${this.baseURL}/route/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new APIError(
                error.detail || 'Route calculation failed',
                response.status,
                error
            );
        }

        return response.json();
    } catch (error) {
        console.error('Route calculation error:', error);
        throw error;
    }
    }
}

export const api = new AquaIntelAPI();
export default api;