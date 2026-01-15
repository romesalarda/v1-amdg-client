import { client } from '~/api/client.gen'
import { axiosInstance } from '~/utils/axios'
// @ts-ignore
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    // Inject our custom axios instance (with interceptors) into the generated client
    // @ts-ignore - The type definition might not expose 'instance' widely but it usually works for axios-client
    client.instance = axiosInstance
})
