import { type ClientOptions, type Config, createClient, createConfig } from './client';
import type { ClientOptions as ClientOptions2 } from './types.gen';
import { getCsrfToken } from '@/utils/csrf';

export type CreateClientConfig<T extends ClientOptions = ClientOptions2> = (override?: Config<ClientOptions & T>) => Config<Required<ClientOptions> & T>;

export const client = createClient(createConfig<ClientOptions2>({
    baseUrl: '',
    credentials: 'include',
}));

// Add CSRF token to all requests
client.interceptors.request.use((request) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
        request.headers.set('X-CSRFToken', csrfToken);
    }
    return request;
});

// Response interceptor for success
client.interceptors.response.use((response) => response);

