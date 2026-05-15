<template>
  <div class="rounded-xl border border-navy-100/60 bg-white overflow-hidden">
    <!-- Header: Edit / Preview toggle -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-mist-blue/60 border-b border-navy-100/60">
      <p class="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em]">Markdown Editor</p>
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="showPreview = false"
          :class="!showPreview ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'"
          class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-sm">edit</span>
          Edit
        </button>
        <button
          type="button"
          @click="showPreview = true"
          :class="showPreview ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'"
          class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-sm">preview</span>
          Preview
        </button>
      </div>
    </div>

    <!-- Formatting toolbar (edit mode only) -->
    <div v-if="!showPreview" class="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-white border-b border-navy-100/60">
      <!-- Headings -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="insertBlock('# ')" title="Heading 1" class="toolbar-btn font-black">H1</button>
        <button type="button" @click="insertBlock('## ')" title="Heading 2" class="toolbar-btn font-black">H2</button>
        <button type="button" @click="insertBlock('### ')" title="Heading 3" class="toolbar-btn font-black">H3</button>
      </div>

      <span class="w-px h-5 bg-navy-200 mx-1"></span>

      <!-- Inline formatting -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="wrapInline('**', '**')" title="Bold" class="toolbar-btn"><b>B</b></button>
        <button type="button" @click="wrapInline('_', '_')" title="Italic" class="toolbar-btn"><i>I</i></button>
        <button type="button" @click="wrapInline('~~', '~~')" title="Strikethrough" class="toolbar-btn"><s>S</s></button>
        <button type="button" @click="wrapInline('`', '`')" title="Inline code" class="toolbar-btn font-mono text-xs">&lt;/&gt;</button>
      </div>

      <span class="w-px h-5 bg-navy-200 mx-1"></span>

      <!-- Lists -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="insertLinePrefix('- ')" title="Unordered list" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">format_list_bulleted</span>
        </button>
        <button type="button" @click="insertOrderedList" title="Ordered list" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">format_list_numbered</span>
        </button>
        <button type="button" @click="insertLinePrefix('- [ ] ')" title="Checklist" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">checklist</span>
        </button>
      </div>

      <span class="w-px h-5 bg-navy-200 mx-1"></span>

      <!-- Block elements -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="insertLinePrefix('> ')" title="Blockquote" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">format_quote</span>
        </button>
        <button type="button" @click="wrapBlock('```\n', '\n```')" title="Code block" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">code</span>
        </button>
        <button type="button" @click="insertAtCursor('\n\n---\n\n')" title="Horizontal rule" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">horizontal_rule</span>
        </button>
      </div>

      <span class="w-px h-5 bg-navy-200 mx-1"></span>

      <!-- Link -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="insertLink" title="Link" class="toolbar-btn">
          <span class="material-symbols-outlined text-base leading-none">link</span>
        </button>
      </div>
    </div>


    <!-- Editor textarea -->
    <textarea
      v-if="!showPreview"
      ref="textareaRef"
      :value="modelValue"
      @input="onInput"
      @keydown.tab.prevent="onTab"
      rows="14"
      placeholder="Write your content using Markdown…"
      spellcheck="true"
      class="w-full px-4 py-4 bg-white text-sm text-navy-700 leading-relaxed resize-y font-mono focus:outline-none focus:ring-0 border-0"
    />

    <!-- Preview pane -->
    <div v-else class="min-h-[200px] px-6 py-5 bg-mist-blue/30">
      <MarkdownPreview :content="modelValue" />
    </div>

    <!-- Footer: character count -->
    <div v-if="!showPreview" class="flex justify-end px-4 py-1.5 border-t border-navy-100/60 bg-mist-blue/30">
      <span class="text-[10px] text-navy-400 font-medium font-mono">{{ (modelValue ?? '').length }} chars</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownPreview from '~/components/events/MarkdownPreview.vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showPreview = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

// ── Insertion helpers ────────────────────────────────────────────────────────

function replaceSelection(replacement: string, cursorOffset?: number) {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const current = props.modelValue ?? ''
  const next = current.slice(0, ss) + replacement + current.slice(se)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.focus()
    const pos = ss + (cursorOffset ?? replacement.length)
    ta.setSelectionRange(pos, pos)
  })
}

function wrapInline(before: string, after: string, placeholder = 'text') {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const selected = (props.modelValue ?? '').slice(ss, se) || placeholder
  const replacement = `${before}${selected}${after}`
  replaceSelection(replacement, before.length + selected.length + after.length)
}

function insertLinePrefix(prefix: string) {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const current = props.modelValue ?? ''
  const lineStart = current.lastIndexOf('\n', ss - 1) + 1
  const selectedLines = current.slice(lineStart, se)
  const toggling = selectedLines
    .split('\n')
    .every((l) => l.trimStart().startsWith(prefix.trimEnd()))
  const updated = selectedLines
    .split('\n')
    .map((l) =>
      toggling
        ? l.replace(new RegExp('^(\\s*)' + escapeRe(prefix.trimEnd()) + '\\s?'), '$1')
        : prefix + l,
    )
    .join('\n')
  const next = current.slice(0, lineStart) + updated + current.slice(se)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(lineStart, lineStart + updated.length)
  })
}

function insertOrderedList() {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const current = props.modelValue ?? ''
  const lineStart = current.lastIndexOf('\n', ss - 1) + 1
  const lines = current.slice(lineStart, se).split('\n')
  const updated = lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
  const next = current.slice(0, lineStart) + updated + current.slice(se)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(lineStart, lineStart + updated.length)
  })
}

function insertBlock(prefix: string) {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const current = props.modelValue ?? ''
  const lineStart = current.lastIndexOf('\n', ss - 1) + 1
  const lineEnd = current.indexOf('\n', se)
  const end = lineEnd === -1 ? current.length : lineEnd
  const stripped = current.slice(lineStart, end).replace(/^#{1,6}\s*/, '')
  const updated = `${prefix}${stripped}`
  const next = current.slice(0, lineStart) + updated + current.slice(end)
  emit('update:modelValue', next)
  nextTick(() => {
    ta.focus()
    const pos = lineStart + updated.length
    ta.setSelectionRange(pos, pos)
  })
}

function wrapBlock(before: string, after: string) {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const selected = (props.modelValue ?? '').slice(ss, se) || 'code'
  replaceSelection(`${before}${selected}${after}`, before.length + selected.length + after.length)
}

function insertAtCursor(text: string) {
  replaceSelection(text)
}

function insertLink() {
  const ta = textareaRef.value
  if (!ta) return
  const { selectionStart: ss, selectionEnd: se } = ta
  const label = (props.modelValue ?? '').slice(ss, se) || 'link text'
  const replacement = `[${label}](url)`
  replaceSelection(replacement, replacement.length - 1)
}

function onTab() {
  insertAtCursor('  ')
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<style scoped>
.toolbar-btn {
  @apply flex items-center justify-center w-7 h-7 rounded text-xs text-navy-600 hover:bg-mist-blue hover:text-primary transition-colors select-none;
}
</style>
