<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="!resources || resources.length === 0" class="flex flex-col items-center justify-center rounded-xl border border-dashed border-deep-navy/20 bg-mist-blue/20 py-16 text-center">
      <svg class="h-12 w-12 text-deep-navy/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-3 text-sm font-semibold text-deep-navy/70">No resources available</p>
      <p class="mt-1 text-xs text-deep-navy/60">Event organizers haven't added any resources yet.</p>
    </div>

    <!-- Resources grid -->
    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
        <article
          v-for="resource in resources"
          :key="resource.id"
          class="overflow-hidden rounded-2xl border border-deep-navy/10 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <!-- Image preview for IMAGE resources -->
          <template v-if="resource.resource_type === 'IMAGE' && resource.image">
            <div class="relative bg-deep-navy/5">
              <img
                :src="resolveImageUrl(resource.image)"
                :alt="resource.name"
                class="h-40 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                @click="openResourcePreview(resource)"
              />
              <button
                type="button"
                class="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur-sm hover:bg-white transition-colors"
                @click="openResourcePreview(resource)"
                title="View full size"
              >
                <svg class="h-4 w-4 text-deep-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
            </div>
          </template>

          <!-- Content section -->
          <div class="p-4">
            <div class="flex items-start gap-3">
              <!-- Resource type icon -->
              <div class="shrink-0 rounded-lg bg-primary/10 p-2">
                <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <!-- Resource info -->
              <div class="min-w-0 flex-1">
                <h3 class="break-words text-sm font-semibold text-deep-navy">{{ resource.name }}</h3>
                <p v-if="resource.description" class="mt-1 text-xs text-deep-navy/60 line-clamp-2">
                  {{ resource.description }}
                </p>

                <!-- Resource metadata -->
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span class="inline-flex items-center rounded-full bg-deep-navy/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-deep-navy">
                    {{ getResourceTypeLabel(resource.resource_type || 'OTHER') }}
                  </span>
                  <span v-if="resource.added_by_email" class="text-[10px] text-deep-navy/50">
                    by {{ resource.added_by_email }}
                  </span>
                </div>

                <!-- Action buttons -->
                <div class="mt-4 flex gap-2">
                  <button
                    v-if="resource.resource_type === 'IMAGE' && resource.image"
                    type="button"
                    class="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    @click="openResourcePreview(resource)"
                  >
                    View Image
                  </button>

                  <button
                    v-else-if="resource.resource_type === 'LINK' && resource.link"
                    type="button"
                    class="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    @click="openExternalLink(resource.link)"
                  >
                    Open Link
                  </button>

                  <button
                    v-else-if="(resource.resource_type === 'DOCUMENT' || resource.resource_type === 'VIDEO' || resource.resource_type === 'AUDIO' || resource.resource_type === 'OTHER') && resource.file"
                    type="button"
                    class="flex-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    @click="downloadResource(resource)"
                  >
                    Download
                  </button>

                  <button
                    v-if="resource.resource_type === 'IMAGE' && resource.image"
                    type="button"
                    class="rounded-lg border border-deep-navy/20 bg-white px-3 py-2 text-xs font-semibold text-deep-navy hover:border-deep-navy/40 transition-colors"
                    @click="downloadResource(resource)"
                    title="Download original"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Full-size image preview modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showImagePreview"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          @click.self="closeImagePreview"
        >
          <div class="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
            <!-- Header -->
            <div class="sticky top-0 flex items-center justify-between border-b border-deep-navy/10 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <h2 class="text-headline-sm font-headline text-deep-navy">{{ previewResource?.name }}</h2>
              <button
                type="button"
                class="rounded-lg p-2 hover:bg-deep-navy/5 transition-colors"
                @click="closeImagePreview"
              >
                <svg class="h-6 w-6 text-deep-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Image -->
            <div class="flex items-center justify-center bg-deep-navy/5 p-4">
              <img
                v-if="previewResource?.image"
                :src="resolveImageUrl(previewResource.image)"
                :alt="previewResource.name"
                @error="onImageError"
                class="max-h-[calc(90vh-200px)] w-auto object-contain"
              />
            </div>

            <!-- Footer -->
            <div class="border-t border-deep-navy/10 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <p v-if="previewResource?.description" class="text-sm text-deep-navy/70">
                    {{ previewResource.description }}
                  </p>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                  @click="previewResource && downloadResource(previewResource)"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { resolveImageUrl, onImageError } from '~/utils/image'
import type { Resource } from '~/api/types.gen'

const props = defineProps<{
  resources?: Resource[] | null
}>()

const showImagePreview = ref(false)
const previewResource = ref<Resource | null>(null)

function getResourceTypeLabel(resourceType: string): string {
  const labels: Record<string, string> = {
    IMAGE: 'Image',
    DOCUMENT: 'Document',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    LINK: 'Link',
    OTHER: 'File',
  }
  return labels[resourceType] || resourceType
}

function openResourcePreview(resource: Resource) {
  previewResource.value = resource
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
  setTimeout(() => {
    previewResource.value = null
  }, 300)
}

function downloadResource(resource: Resource) {
  const url = resource.image || resource.file
  if (!url) return

  const link = document.createElement('a')
  link.href = resolveImageUrl(url)
  link.download = resource.name || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function openExternalLink(link: string) {
  if (!link) return
  window.open(link, '_blank', 'noopener,noreferrer')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
