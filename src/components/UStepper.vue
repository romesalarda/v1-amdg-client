<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3">
    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="(item, index) in items"
        :key="item.key"
        type="button"
        class="group relative rounded-lg border px-3 py-2 text-left transition-colors"
        :class="index === modelValue
          ? 'border-primary bg-primary/5'
          : index < modelValue
            ? 'border-green-200 bg-green-50/60'
            : 'border-gray-200 bg-white hover:bg-gray-50'"
        @click="$emit('update:modelValue', index)"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold"
            :class="index === modelValue
              ? 'border-primary bg-primary text-white'
              : index < modelValue
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-gray-300 bg-white text-gray-700'"
          >
            {{ index + 1 }}
          </span>

          <UIcon
            v-if="item.icon"
            :name="item.icon"
            class="h-4 w-4"
            :class="index === modelValue ? 'text-primary' : 'text-gray-500'"
          />

          <span
            class="text-xs font-semibold uppercase tracking-wide"
            :class="index === modelValue ? 'text-primary' : 'text-gray-700'"
          >
            {{ item.label }}
          </span>
        </div>

        <div class="mt-1 text-sm font-bold text-gray-900">
          {{ item.count }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export type StepperItem = {
  key: string
  label: string
  icon?: string
  count?: number
}

defineProps<{
  modelValue: number
  items: StepperItem[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>
