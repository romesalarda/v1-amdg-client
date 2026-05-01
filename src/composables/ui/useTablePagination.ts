import { ref } from 'vue'

export function useTablePagination(defaultPageSize = 25) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)

  function resetPage() {
    currentPage.value = 1
  }

  return { currentPage, pageSize, resetPage }
}
