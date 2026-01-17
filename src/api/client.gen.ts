import { type ClientOptions, type Config, createClient, createConfig } from './client';
import type { ClientOptions as ClientOptions2 } from './types.gen';
import { getCsrfToken } from '@/utils/csrf';

/**
 * The `createClientConfig()` function will be called on client initialization
 * and the returned object will become the client's initial configuration.
 *
 * You may want to initialize your client this way instead of calling
 * `setConfig()`. This is useful for example if you're using Next.js
 * to ensure your client always has the correct values.
 */
export type CreateClientConfig<T extends ClientOptions = ClientOptions2> = (override?: Config<ClientOptions & T>) => Config<Required<ClientOptions> & T>;

export const client = createClient(createConfig<ClientOptions2>({
    baseUrl: '',  // Use relative URLs with Nuxt proxy
    credentials: 'include',  // Include cookies for session auth
}));

// Add CSRF token to all requests using request interceptor
client.interceptors.request.use((request) => {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
        request.headers.set('X-CSRFToken', csrfToken);
    }
    return request;
});
