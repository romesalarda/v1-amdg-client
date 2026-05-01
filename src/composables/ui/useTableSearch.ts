import { ref, watch } from 'vue'

export function useTableSearch(onReset?: () => void) {
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  let searchTimeout: ReturnType<typeof setTimeout>

  watch(searchQuery, (newValue) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearch.value = newValue
      onReset?.()
    }, 300)
  })

  function clearSearch() {
    searchQuery.value = ''
    debouncedSearch.value = ''
  }

  return { searchQuery, debouncedSearch, clearSearch }
}
