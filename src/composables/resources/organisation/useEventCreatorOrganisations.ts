import { computed, ref, watch, type MaybeRefOrGetter } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { toValue } from 'vue'
import { useOrganisations } from './organisations'
import type { OrganisationsListListData } from '~/api/types.gen'

export type EventCreatorOrganisationOption = {
  id: number
  title: string
}

/**
 * List organisations the current user is authorised to create events in
 * (organisation controller or leader with ALLOW_EVENT_APPROVAL create access).
 */
export const useEventCreatorOrganisations = (
  params?: MaybeRefOrGetter<Omit<OrganisationsListListData['query'], 'authorised_event_creator'> | undefined>
) => {
  return useOrganisations(
    computed(() => ({
      ...toValue(params),
      authorised_event_creator: true,
    }))
  )
}

/**
 * Searchable variant mirroring useOrganisationSearch, restricted to
 * organisations the current user can create events for.
 */
export const useEventCreatorOrganisationSearch = (searchQuery: MaybeRefOrGetter<string>) => {
  const debouncedSearch = ref('')

  const updateDebounced = useDebounceFn((value: string) => {
    debouncedSearch.value = value
  }, 250)

  watch(
    () => toValue(searchQuery),
    (value) => {
      updateDebounced(String(value || ''))
    },
    { immediate: true }
  )

  const query = useEventCreatorOrganisations(
    computed(() => ({
      page_size: 80,
      ordering: 'title',
      search: debouncedSearch.value.trim() || undefined,
    }))
  )

  const options = computed<EventCreatorOrganisationOption[]>(() => {
    const rows = query.data.value?.data?.results || []
    return rows
      .map((row: any) => ({
        id: Number(row.id),
        title: String(row.title || '').trim(),
      }))
      .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.title.length > 0)
  })

  return {
    options,
    isLoading: query.isLoading,
  }
}
