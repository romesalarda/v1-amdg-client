import { ref, computed } from 'vue'

export interface SectionIssue {
  id: string
  sectionKey: string
  sectionLabel: string
  comment: string
}

export function useReviewIssues() {
  const sectionIssues = ref<SectionIssue[]>([])
  const activeFlagSection = ref<string | null>(null)
  const flagDraft = ref('')

  const issuesForSection = (key: string) =>
    sectionIssues.value.filter(i => i.sectionKey === key)

  const toggleFlag = (key: string) => {
    if (activeFlagSection.value === key) {
      activeFlagSection.value = null
      flagDraft.value = ''
    } else {
      activeFlagSection.value = key
      flagDraft.value = ''
    }
  }

  const addIssue = (sectionKey: string, sectionLabel: string) => {
    const trimmed = flagDraft.value.trim()
    if (!trimmed) return
    sectionIssues.value.push({
      id: `${sectionKey}-${Date.now()}`,
      sectionKey,
      sectionLabel,
      comment: trimmed,
    })
    flagDraft.value = ''
    activeFlagSection.value = null
  }

  const removeIssue = (id: string) => {
    sectionIssues.value = sectionIssues.value.filter(i => i.id !== id)
  }

  /** Compiles all flagged issues to a markdown checklist string. */
  const compiledNotes = computed(() => {
    if (!sectionIssues.value.length) return ''
    return sectionIssues.value
      .map(i => `- [ ] **${i.sectionLabel}**: ${i.comment}`)
      .join('\n')
  })

  return {
    sectionIssues,
    activeFlagSection,
    flagDraft,
    issuesForSection,
    toggleFlag,
    addIssue,
    removeIssue,
    compiledNotes,
  }
}
