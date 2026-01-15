import { useQuery } from '@tanstack/vue-query'
import { eventListList, eventListRetrieve } from '~/api/sdk.gen'
import type { EventListListData } from '~/api/types.gen'

export const useEvents = (params: EventListListData['query'] = {}) => {
    return useQuery({
        queryKey: ['events', params],
        queryFn: () => eventListList({ query: params }).then(res => res.data)
    })
}

export const useEvent = (id: string) => {
    return useQuery({
        queryKey: ['events', id],
        queryFn: () => eventListRetrieve({ path: { event_id: id } }).then(res => res.data)
    })
}
