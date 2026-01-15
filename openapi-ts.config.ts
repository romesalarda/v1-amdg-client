import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    client: '@hey-api/client-axios',
    input: 'amdg-api.yaml',
    output: 'src/api',
    types: {
        enums: 'javascript',
    },
});
