<template>
  <img
    :src="resolvedSrc"
    :alt="alt"
    :width="resolvedWidth ?? undefined"
    :height="resolvedHeight ?? undefined"
    :loading="lazy ? 'lazy' : 'eager'"
    :class="[fitClass, $attrs.class]"
    v-bind="attrsWithoutClass"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { getImageUrl, resolveImageUrl, onImageError } from '~/utils/image'
import type { Resource } from '~/api/types.gen'

/**
 * AppImage — reusable responsive image component.
 *
 * Picks the best available variant from a Resource's image_urls when present,
 * falling back to resolveImageUrl(resource.image) for pre-variant records.
 * Existing pages that use raw <img> + resolveImageUrl() are unaffected.
 */

// Prevent $attrs.class from being applied automatically to root — we handle it.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Full Resource object from the API. Provide this OR src. */
    resource?: Resource | null
    /** Standalone image URL. Used when no resource object is available. */
    src?: string | null
    /** Alt text (always required for accessibility). */
    alt: string
    /**
     * CSS object-fit behaviour.
     * - cover  → fills the container, crops excess (default)
     * - contain → fits inside the container, letterboxes
     */
    fit?: 'cover' | 'contain'
    /**
     * Which variant to prefer.
     * - thumbnail → ~300px WEBP
     * - medium    → ~1200px WEBP (default)
     * - large     → ~1920px WEBP
     * - original  → the raw uploaded file
     */
    size?: 'thumbnail' | 'medium' | 'large' | 'original'
    /** Disable lazy loading for above-the-fold images (e.g. heroes). */
    lazy?: boolean
    /** Optional explicit width. Falls back to resource.image_width for CLS prevention. */
    width?: number
    /** Optional explicit height. Falls back to resource.image_height for CLS prevention. */
    height?: number
  }>(),
  {
    fit: 'cover',
    size: 'medium',
    lazy: true,
  }
)

const attrs = useAttrs()

// Strip class from attrs so we can merge it ourselves without duplication.
const attrsWithoutClass = computed(() => {
  const { class: _, ...rest } = attrs as Record<string, unknown>
  return rest
})

const fitClass = computed(() =>
  props.fit === 'contain' ? 'object-contain' : 'object-cover'
)

const resolvedSrc = computed(() => {
  if (props.resource) {
    return getImageUrl(props.resource, props.size ?? 'medium')
  }
  return resolveImageUrl(props.src)
})

const resolvedWidth = computed(() =>
  props.width ?? props.resource?.image_width ?? null
)

const resolvedHeight = computed(() =>
  props.height ?? props.resource?.image_height ?? null
)

function handleError(event: Event) {
  onImageError(event)
}
</script>
